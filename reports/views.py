from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from transactions.models import Transaction


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

    transactions = Transaction.objects.filter(
        owner=user,
        is_deleted=False,
        date__gte=start_date,
        date__lte=end_date
    )

    # Calculate totals
    income = transactions.filter(type=Transaction.TYPE_INCOME).aggregate(
        total=Sum('amount')
    )['total'] or 0

    expense = transactions.filter(type=Transaction.TYPE_EXPENSE).aggregate(
        total=Sum('amount')
    )['total'] or 0

    balance = income - expense

    # Count transactions
    income_count = transactions.filter(type=Transaction.TYPE_INCOME).count()
    expense_count = transactions.filter(type=Transaction.TYPE_EXPENSE).count()

    return Response({
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
    })


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
    """
    user = request.user
    period = request.query_params.get('period', 'monthly')
    months = int(request.query_params.get('months', 6))

    end_date = timezone.now()
    start_date = end_date - timedelta(days=30 * months)

    transactions = Transaction.objects.filter(
        owner=user,
        is_deleted=False,
        date__gte=start_date,
        date__lte=end_date
    )

    # TODO: Implement proper grouping by period
    # For now, return monthly aggregates
    from django.db.models.functions import TruncMonth

    monthly_data = transactions.annotate(
        month=TruncMonth('date')
    ).values('month', 'type').annotate(
        total=Sum('amount'),
        count=Count('id')
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

    # Calculate all-time balance
    all_transactions = Transaction.objects.filter(
        owner=user,
        is_deleted=False
    )

    income = all_transactions.filter(type=Transaction.TYPE_INCOME).aggregate(
        total=Sum('amount')
    )['total'] or 0

    expense = all_transactions.filter(type=Transaction.TYPE_EXPENSE).aggregate(
        total=Sum('amount')
    )['total'] or 0

    current_balance = income - expense

    # Recent transactions
    recent = all_transactions.select_related('category').order_by('-date')[:10]

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
