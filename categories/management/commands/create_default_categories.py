from django.core.management.base import BaseCommand
from categories.models import Category


class Command(BaseCommand):
    help = 'Create default global categories'

    def handle(self, *args, **options):
        """Create default categories."""
        default_categories = [
            # Income categories
            {'name': 'Salary', 'type': Category.TYPE_INCOME, 'color': '#4CAF50', 'icon': '💼'},
            {'name': 'Freelance', 'type': Category.TYPE_INCOME, 'color': '#8BC34A', 'icon': '💻'},
            {'name': 'Investment', 'type': Category.TYPE_INCOME, 'color': '#CDDC39', 'icon': '📈'},
            {'name': 'Gift', 'type': Category.TYPE_INCOME, 'color': '#FFC107', 'icon': '🎁'},
            {'name': 'Other Income', 'type': Category.TYPE_INCOME, 'color': '#FF9800', 'icon': '💰'},

            # Expense categories
            {'name': 'Groceries', 'type': Category.TYPE_EXPENSE, 'color': '#F44336', 'icon': '🛒'},
            {'name': 'Utilities', 'type': Category.TYPE_EXPENSE, 'color': '#E91E63', 'icon': '⚡'},
            {'name': 'Rent', 'type': Category.TYPE_EXPENSE, 'color': '#9C27B0', 'icon': '🏠'},
            {'name': 'Transport', 'type': Category.TYPE_EXPENSE, 'color': '#673AB7', 'icon': '🚗'},
            {'name': 'Healthcare', 'type': Category.TYPE_EXPENSE, 'color': '#3F51B5', 'icon': '⚕️'},
            {'name': 'Entertainment', 'type': Category.TYPE_EXPENSE, 'color': '#2196F3', 'icon': '🎬'},
            {'name': 'Dining Out', 'type': Category.TYPE_EXPENSE, 'color': '#03A9F4', 'icon': '🍽️'},
            {'name': 'Shopping', 'type': Category.TYPE_EXPENSE, 'color': '#00BCD4', 'icon': '🛍️'},
            {'name': 'Education', 'type': Category.TYPE_EXPENSE, 'color': '#009688', 'icon': '📚'},
            {'name': 'Insurance', 'type': Category.TYPE_EXPENSE, 'color': '#4CAF50', 'icon': '🛡️'},
            {'name': 'Other Expense', 'type': Category.TYPE_EXPENSE, 'color': '#607D8B', 'icon': '💸'},
        ]

        created_count = 0
        for cat_data in default_categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                owner=None,  # Global category
                defaults={
                    'type': cat_data['type'],
                    'color': cat_data['color'],
                    'icon': cat_data['icon'],
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} default categories')
        )
