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

    class Meta:
        model = Transaction
        fields = ['type', 'category', 'currency', 'is_recurring']

    def search_filter(self, queryset, name, value):
        """Search in title and note fields."""
        return queryset.filter(
            models.Q(title__icontains=value) |
            models.Q(note__icontains=value)
        )
