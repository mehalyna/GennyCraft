from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from .models import Transaction
from categories.models import Category

User = get_user_model()


class TransactionModelTest(TestCase):
    """Test cases for Transaction model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            owner=self.user,
            name='Groceries',
            type=Category.TYPE_EXPENSE
        )

    def test_create_transaction(self):
        """Test creating a transaction."""
        transaction = Transaction.objects.create(
            owner=self.user,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('50.00'),
            currency='USD',
            date=timezone.now(),
            category=self.category,
            title='Weekly groceries'
        )
        self.assertEqual(transaction.amount, Decimal('50.00'))
        self.assertEqual(transaction.owner, self.user)
        self.assertEqual(transaction.category, self.category)


class TransactionAPITest(APITestCase):
    """Test cases for Transaction API."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(
            owner=self.user,
            name='Groceries',
            type=Category.TYPE_EXPENSE
        )

    def test_list_transactions(self):
        """Test listing transactions."""
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_transaction(self):
        """Test creating a transaction."""
        data = {
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'currency': 'USD',
            'date': timezone.now().isoformat(),
            'category': self.category.id,
            'title': 'Grocery shopping'
        }
        response = self.client.post('/api/transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], '50.00')
