from django.db import models
from django.conf import settings


class Category(models.Model):
    """Category for classifying transactions."""

    TYPE_INCOME = 'income'
    TYPE_EXPENSE = 'expense'
    TYPE_BOTH = 'both'

    TYPE_CHOICES = [
        (TYPE_INCOME, 'Income'),
        (TYPE_EXPENSE, 'Expense'),
        (TYPE_BOTH, 'Both'),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True,
        help_text='Null for global categories'
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=TYPE_BOTH)
    color = models.CharField(max_length=7, blank=True, help_text='Hex color code (e.g., #FF5733)')
    icon = models.CharField(max_length=50, blank=True, help_text='Icon name or emoji')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['owner', 'type']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['owner', 'name'],
                name='unique_category_per_user',
                condition=models.Q(owner__isnull=False)
            ),
        ]

    def __str__(self):
        owner_str = f'{self.owner.email}' if self.owner else 'Global'
        return f'{self.name} ({owner_str})'

    def is_global(self):
        """Check if this is a global category."""
        return self.owner is None
