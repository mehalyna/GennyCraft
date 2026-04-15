from django_filters import rest_framework as filters
from django.db import models
from .models import Transaction


class TransactionFilter(filters.FilterSet):
    """Filters for Transaction queryset."""
    date_from = filters.DateTimeFilter(field_name='date', lookup_expr='gte')
    date_to = filters.DateTimeFilter(field_name='date', lookup_expr='lte')
    amount_min = filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = filters.NumberFilter(field_name='amount', lookup_expr='lte')
    search = filters.CharFilter(method='search_filter')
    month = filters.NumberFilter(method='filter_by_month')
    year = filters.NumberFilter(method='filter_by_year')

    class Meta:
        model = Transaction
        fields = ['type', 'category', 'currency', 'is_recurring']

    def search_filter(self, queryset, name, value):
        """Search in title and note fields."""
        return queryset.filter(
            models.Q(title__icontains=value) |
            models.Q(note__icontains=value)
        )
    
    def filter_by_month(self, queryset, name, value):
        """
        Filter transactions by month (1-12).
        Uses date range instead of month extraction to leverage indexes.
        Requires 'year' parameter to be set as well.
        """
        if not (1 <= value <= 12):
            return queryset.none()
        
        # Get year from request or use current year
        year = self.request.query_params.get('year')
        if not year:
            from django.utils import timezone
            year = timezone.now().year
        else:
            year = int(year)
        
        # Calculate month start and end dates
        from datetime import datetime, timedelta
        from django.utils import timezone as tz
        
        month_start = tz.make_aware(datetime(year, value, 1))
        
        # Calculate next month for range end
        if value == 12:
            month_end = tz.make_aware(datetime(year + 1, 1, 1))
        else:
            month_end = tz.make_aware(datetime(year, value + 1, 1))
        
        # Use range query which can leverage the (owner, date) index
        return queryset.filter(date__gte=month_start, date__lt=month_end)
    
    def filter_by_year(self, queryset, name, value):
        """
        Filter transactions by year.
        Uses date range instead of year extraction to leverage indexes.
        """
        from datetime import datetime
        from django.utils import timezone as tz
        
        year_start = tz.make_aware(datetime(value, 1, 1))
        year_end = tz.make_aware(datetime(value + 1, 1, 1))
        
        # Use range query which can leverage the (owner, date) index
        return queryset.filter(date__gte=year_start, date__lt=year_end)
