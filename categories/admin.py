from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'owner', 'color', 'is_active', 'created_at')
    list_filter = ('type', 'is_active', 'created_at')
    search_fields = ('name', 'owner__email')
    readonly_fields = ('created_at', 'updated_at')
    list_per_page = 50

    fieldsets = (
        (None, {'fields': ('owner', 'name', 'type')}),
        ('Display', {'fields': ('color', 'icon')}),
        ('Status', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
