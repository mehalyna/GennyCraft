from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
import os


def transaction_attachment_path(instance, filename):
    """Generate file path for transaction attachment."""
    return f'transactions/{instance.owner.id}/{instance.id}/{filename}'


class Transaction(models.Model):
    """Financial transaction (income or expense)."""

    TYPE_INCOME = 'income'
    TYPE_EXPENSE = 'expense'

    TYPE_CHOICES = [
        (TYPE_INCOME, 'Income'),
        (TYPE_EXPENSE, 'Expense'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='transactions',
        help_text='The account this transaction belongs to'
    )
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(max_length=3, default='USD')
    date = models.DateTimeField()
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    title = models.CharField(max_length=200, blank=True)
    note = models.TextField(blank=True)
    attachment = models.FileField(
        upload_to=transaction_attachment_path,
        blank=True,
        null=True
    )

    # Recurring transaction fields
    is_recurring = models.BooleanField(default=False)
    recurring_rule = models.CharField(max_length=200, blank=True, help_text='RRULE format or structured')

    # Soft delete
    is_deleted = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['owner', 'date']),
            models.Index(fields=['owner', 'type']),
            models.Index(fields=['owner', 'category']),
            models.Index(fields=['owner', 'is_deleted']),
            models.Index(fields=['account', 'is_deleted']),
            models.Index(fields=['account', 'date']),
        ]

    def __str__(self):
        sign = '+' if self.type == self.TYPE_INCOME else '-'
        return f'{sign}{self.currency} {self.amount} - {self.title or self.category.name}'

    def delete(self, using=None, keep_parents=False):
        """Soft delete the transaction."""
        self.is_deleted = True
        self.save()

    def hard_delete(self):
        """Permanently delete the transaction."""
        if self.attachment:
            if os.path.isfile(self.attachment.path):
                os.remove(self.attachment.path)
        super().delete()


class RecurringInstance(models.Model):
    """Track recurring transaction instances."""

    transaction_template = models.ForeignKey(
        Transaction,
        on_delete=models.CASCADE,
        related_name='recurring_instances'
    )
    next_date = models.DateTimeField()
    frequency = models.CharField(max_length=20)  # daily, weekly, monthly, yearly
    last_generated_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_date']

    def __str__(self):
        return f'Recurring: {self.transaction_template.title} - Next: {self.next_date}'
