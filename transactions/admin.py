from django.contrib import admin
from .models import Transaction, RecurringInstance


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'owner', 'type', 'amount', 'currency', 'category',
        'title', 'date', 'is_recurring', 'is_deleted', 'created_at'
    )
    list_filter = ('type', 'is_recurring', 'is_deleted', 'currency', 'date', 'created_at')
    search_fields = ('owner__email', 'title', 'note', 'category__name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'date'
    list_per_page = 50

    fieldsets = (
        (None, {
            'fields': ('owner', 'type', 'amount', 'currency', 'date', 'category')
        }),
        ('Details', {
            'fields': ('title', 'note', 'attachment')
        }),
        ('Recurring', {
            'fields': ('is_recurring', 'recurring_rule')
        }),
        ('Status', {
            'fields': ('is_deleted',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(RecurringInstance)
class RecurringInstanceAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_template', 'next_date', 'frequency',
        'is_active', 'last_generated_at'
    )
    list_filter = ('frequency', 'is_active', 'next_date')
    search_fields = ('transaction_template__title',)
    readonly_fields = ('created_at', 'updated_at', 'last_generated_at')
