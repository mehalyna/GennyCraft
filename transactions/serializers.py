from rest_framework import serializers
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from decimal import Decimal

from .models import Transaction, RecurringInstance
from categories.serializers import CategorySerializer


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    category_details = CategorySerializer(source='category', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'account', 'account_name', 'type', 'amount', 'currency', 'date',
            'category', 'category_details', 'title', 'note',
            'attachment', 'is_recurring', 'recurring_rule',
            'is_deleted', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'is_deleted', 'created_at', 'updated_at')

    def validate_amount(self, value):
        """Ensure amount is positive."""
        if value <= Decimal('0'):
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_date(self, value):
        """Ensure date is not too far in the future."""
        max_days = getattr(settings, 'MAX_FUTURE_DATE_DAYS', 365)
        max_date = timezone.now() + timedelta(days=max_days)
        if value > max_date:
            raise serializers.ValidationError(f'Date cannot be more than {max_days} days in the future.')
        return value

    def validate(self, attrs):
        """Validate category matches transaction type and account belongs to user."""
        user = self.context['request'].user
        
        # Validate account ownership
        if 'account' in attrs:
            account = attrs['account']
            if account.user != user:
                raise serializers.ValidationError({'account': 'Invalid account.'})
        
        # Validate category
        if 'category' in attrs and 'type' in attrs:
            category = attrs['category']
            trans_type = attrs['type']

            # Check if category belongs to user or is global
            if category.owner and category.owner != user:
                raise serializers.ValidationError({'category': 'Invalid category.'})

            # Check if category type matches transaction type
            from categories.models import Category
            if category.type == Category.TYPE_BOTH:
                pass  # Any type is OK
            elif category.type == Category.TYPE_INCOME and trans_type != Transaction.TYPE_INCOME:
                raise serializers.ValidationError({'category': 'Category is for income only.'})
            elif category.type == Category.TYPE_EXPENSE and trans_type != Transaction.TYPE_EXPENSE:
                raise serializers.ValidationError({'category': 'Category is for expenses only.'})

        return attrs

    def create(self, validated_data):
        """Set owner when creating."""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class TransactionListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list view."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'account', 'account_name', 'type', 'amount', 'currency', 'date',
            'category_name', 'category_icon', 'title',
            'created_at'
        )


class RecurringInstanceSerializer(serializers.ModelSerializer):
    """Serializer for RecurringInstance model."""

    class Meta:
        model = RecurringInstance
        fields = (
            'id', 'transaction_template', 'next_date', 'frequency',
            'last_generated_at', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'last_generated_at', 'created_at', 'updated_at')
