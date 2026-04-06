from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.core.cache import cache
from datetime import datetime, timedelta
import hashlib
import logging

from transactions.models import Transaction

logger = logging.getLogger(__name__)


class ReportsRateThrottle(UserRateThrottle):
    """Custom throttle for expensive report endpoints."""
    scope = 'reports'


def generate_cache_key(prefix, user_id, **params):
    """Generate deterministic cache key from parameters."""
    param_str = '&'.join(f'{k}={v}' for k, v in sorted(params.items()))
    param_hash = hashlib.md5(param_str.encode()).hexdigest()
    return f'{prefix}:{user_id}:{param_hash}'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request):
    """
    Get financial summary for a date range.
    Query params: start (YYYY-MM-DD), end (YYYY-MM-DD)
    """
    user = request.user
    start_date = request.query_params.get('start')
    end_date = request.query_params.get('end')

    # Default to current month
    if not start_date or not end_date:
        now = timezone.now()
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
    else:
        start_date = datetime.fromisoformat(start_date)
        end_date = datetime.fromisoformat(end_date)
    
    # Check cache first
    cache_key = generate_cache_key(
        'summary',
        user.id,
        start=start_date.isoformat(),
        end=end_date.isoformat()
    )
    
    cached_result = cache.get(cache_key)
    if cached_result:
        logger.info(f"Cache hit for summary: user={user.id}")
        return Response(cached_result)

    # Cache miss - compute from database
    logger.info(f"Cache miss for summary: user={user.id}")
    
    # OPTIMIZED: Single query with conditional aggregation instead of 4 separate queries
    from django.db.models import Case, When, DecimalField, IntegerField
    
    result_agg = Transaction.objects.filter(
        owner=user,
        is_deleted=False,
        date__gte=start_date,
        date__lte=end_date
    ).aggregate(
        income_total=Sum(
            Case(
                When(type=Transaction.TYPE_INCOME, then='amount'),
                default=0,
                output_field=DecimalField()
            )
        ),
        expense_total=Sum(
            Case(
                When(type=Transaction.TYPE_EXPENSE, then='amount'),
                default=0,
                output_field=DecimalField()
            )
        ),
        income_count=Sum(
            Case(
                When(type=Transaction.TYPE_INCOME, then=1),
                default=0,
                output_field=IntegerField()
            )
        ),
        expense_count=Sum(
            Case(
                When(type=Transaction.TYPE_EXPENSE, then=1),
                default=0,
                output_field=IntegerField()
            )
        )
    )

    income = result_agg['income_total'] or 0
    expense = result_agg['expense_total'] or 0
    income_count = result_agg['income_count'] or 0
    expense_count = result_agg['expense_count'] or 0
    balance = income - expense

    result = {
        'period': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
        },
        'income': {
            'total': float(income),
            'count': income_count,
        },
        'expense': {
            'total': float(expense),
            'count': expense_count,
        },
        'balance': float(balance),
    }
    
    # Cache for 5 minutes (use reports cache)
    cache.set(cache_key, result, timeout=300)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_breakdown(request):
    """
    Get spending/income breakdown by category.
    Query params: start, end, type (income|expense)
    """
    user = request.user
    start_date = request.query_params.get('start')
    end_date = request.query_params.get('end')
    trans_type = request.query_params.get('type', 'expense')

    # Default to current month
    if not start_date or not end_date:
        now = timezone.now()
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
    else:
        start_date = datetime.fromisoformat(start_date)
        end_date = datetime.fromisoformat(end_date)
    
    # Check cache first
    cache_key = generate_cache_key(
        'category_breakdown',
        user.id,
        start=start_date.isoformat(),
        end=end_date.isoformat(),
        type=trans_type
    )
    
    cached_result = cache.get(cache_key)
    if cached_result:
        logger.info(f"Cache hit for category_breakdown: user={user.id}")
        return Response(cached_result)

    # Cache miss - compute from database
    logger.info(f"Cache miss for category_breakdown: user={user.id}")
    transactions = Transaction.objects.filter(
        owner=user,
        is_deleted=False,
        type=trans_type,
        date__gte=start_date,
        date__lte=end_date
    ).values('category__name', 'category__color', 'category__icon').annotate(
        total=Sum('amount'),
        count=Count('id')
    ).order_by('-total')
    
    result = {
        'period': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
        },
        'type': trans_type,
        'categories': list(transactions),
    }
    
    # Cache for 10 minutes
    cache.set(cache_key, result, timeout=600)
    
    return Response(result)

    return Response({
        'period': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat(),
        },
        'type': trans_type,
        'categories': list(transactions),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trends(request):
    """
    Get transaction trends over time.
    Query params: period (daily|weekly|monthly), months (default 6)
    
    OPTIMIZED: Uses functional index on date_trunc for efficient monthly grouping.
    """
    user = request.user
    period = request.query_params.get('period', 'monthly')
    months = int(request.query_params.get('months', 6))

    end_date = timezone.now()
    start_date = end_date - timedelta(days=30 * months)

    # OPTIMIZED: Single query with conditional aggregation by month
    from django.db.models.functions import TruncMonth
    from django.db.models import Case, When, DecimalField
    
    monthly_data = Transaction.objects.filter(
        owner=user,
        is_deleted=False,
        date__gte=start_date,
        date__lte=end_date
    ).annotate(
        month=TruncMonth('date')
    ).values('month').annotate(
        income_total=Sum(
            Case(
                When(type=Transaction.TYPE_INCOME, then='amount'),
                default=0,
                output_field=DecimalField()
            )
        ),
        expense_total=Sum(
            Case(
                When(type=Transaction.TYPE_EXPENSE, then='amount'),
                default=0,
                output_field=DecimalField()
            )
        ),
        income_count=Count(
            Case(
                When(type=Transaction.TYPE_INCOME, then=1),
                default=None
            )
        ),
        expense_count=Count(
            Case(
                When(type=Transaction.TYPE_EXPENSE, then=1),
                default=None
            )
        )
    ).order_by('month')

    return Response({
        'period': period,
        'start': start_date.isoformat(),
        'end': end_date.isoformat(),
        'data': list(monthly_data),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Get dashboard data with current balance and recent transactions."""
    user = request.user

    # OPTIMIZED: Single query with conditional aggregation
    from django.db.models import Case, When, DecimalField
    
    balance_agg = Transaction.objects.filter(
        owner=user,
        is_deleted=False
    ).aggregate(
        income_total=Sum(
            Case(
                When(type=Transaction.TYPE_INCOME, then='amount'),
                default=0,
                output_field=DecimalField()
            )
        ),
        expense_total=Sum(
            Case(
                When(type=Transaction.TYPE_EXPENSE, then='amount'),
                default=0,
                output_field=DecimalField()
            )
        )
    )

    income = balance_agg['income_total'] or 0
    expense = balance_agg['expense_total'] or 0
    current_balance = income - expense

    # Recent transactions - use only() to fetch minimal fields
    recent = Transaction.objects.filter(
        owner=user,
        is_deleted=False
    ).select_related('category').only(
        'id', 'type', 'amount', 'date', 'title',
        'category__name'
    ).order_by('-date')[:10]

    return Response({
        'current_balance': float(current_balance),
        'total_income': float(income),
        'total_expense': float(expense),
        'recent_transactions': [
            {
                'id': t.id,
                'type': t.type,
                'amount': float(t.amount),
                'date': t.date.isoformat(),
                'category': t.category.name,
                'title': t.title,
            }
            for t in recent
        ]
    })
