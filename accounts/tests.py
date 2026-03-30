from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal

from .models import Account
from categories.models import Category
from transactions.models import Transaction

User = get_user_model()


class UserModelTest(TestCase):
    """Test cases for User model."""

    def test_create_user(self):
        """Test creating a regular user."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        """Test creating a superuser."""
        user = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertEqual(user.email, 'admin@example.com')
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)


class UserRegistrationAPITest(APITestCase):
    """Test cases for user registration API."""

    def test_register_user(self):
        """Test user registration endpoint."""
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('user', response.data)

    def test_register_user_password_mismatch(self):
        """Test registration with mismatched passwords."""
        data = {
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'DifferentPass123!',
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class WalletSummaryAPITest(APITestCase):
    """Test cases for the MyWallet wallet-summary endpoint."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='wallet@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

        # Create an active account for the authenticated user
        self.account = Account.objects.create(
            user=self.user,
            name='Main Wallet',
            account_type='cash',
            currency='USD',
            balance=Decimal('1000.00'),
        )

        # Category needed for transactions
        self.income_category = Category.objects.create(
            owner=self.user,
            name='Salary',
            type=Category.TYPE_INCOME,
        )
        self.expense_category = Category.objects.create(
            owner=self.user,
            name='Groceries',
            type=Category.TYPE_EXPENSE,
        )

        self.period_start = '2024-01-01'
        self.period_end = '2024-01-31'

        # Income transaction within the period
        Transaction.objects.create(
            owner=self.user,
            type=Transaction.TYPE_INCOME,
            amount=Decimal('500.00'),
            currency='USD',
            date=timezone.datetime(2024, 1, 15, tzinfo=timezone.utc),
            category=self.income_category,
            title='January Salary',
        )
        # Expense transaction within the period
        Transaction.objects.create(
            owner=self.user,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('200.00'),
            currency='USD',
            date=timezone.datetime(2024, 1, 20, tzinfo=timezone.utc),
            category=self.expense_category,
            title='Grocery shopping',
        )
        # Transaction outside the period (should not be included)
        Transaction.objects.create(
            owner=self.user,
            type=Transaction.TYPE_INCOME,
            amount=Decimal('100.00'),
            currency='USD',
            date=timezone.datetime(2024, 2, 5, tzinfo=timezone.utc),
            category=self.income_category,
            title='February bonus',
        )
        # Transaction belonging to another user (should not appear)
        other_category = Category.objects.create(
            owner=self.other_user,
            name='Other income',
            type=Category.TYPE_INCOME,
        )
        Transaction.objects.create(
            owner=self.other_user,
            type=Transaction.TYPE_INCOME,
            amount=Decimal('999.00'),
            currency='USD',
            date=timezone.datetime(2024, 1, 10, tzinfo=timezone.utc),
            category=other_category,
            title='Other user income',
        )

    def test_wallet_summary_authenticated_with_period(self):
        """Authenticated owner gets correct income/outcome for the given period."""
        # Arrange
        url = '/api/auth/accounts/wallet-summary/'
        # Act
        response = self.client.get(url, {'start': self.period_start, 'end': self.period_end})
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('period', response.data)
        self.assertIn('accounts', response.data)
        self.assertIn('income', response.data)
        self.assertIn('outcome', response.data)
        self.assertIn('net_change', response.data)
        self.assertAlmostEqual(response.data['income'], 500.0)
        self.assertAlmostEqual(response.data['outcome'], 200.0)
        self.assertAlmostEqual(response.data['net_change'], 300.0)

    def test_wallet_summary_default_period(self):
        """Wallet summary defaults to current month when no dates are provided."""
        # Arrange
        url = '/api/auth/accounts/wallet-summary/'
        # Act
        response = self.client.get(url)
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('period', response.data)
        self.assertIn('income', response.data)
        self.assertIn('outcome', response.data)

    def test_wallet_summary_contains_own_accounts(self):
        """Wallet summary response includes the authenticated user's accounts."""
        # Arrange
        url = '/api/auth/accounts/wallet-summary/'
        # Act
        response = self.client.get(url, {'start': self.period_start, 'end': self.period_end})
        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        account_ids = [a['id'] for a in response.data['accounts']]
        self.assertIn(self.account.id, account_ids)

    def test_wallet_summary_unauthenticated(self):
        """Unauthenticated request is rejected with 401."""
        # Arrange
        self.client.force_authenticate(user=None)
        url = '/api/auth/accounts/wallet-summary/'
        # Act
        response = self.client.get(url)
        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_wallet_summary_excludes_other_user_data(self):
        """Other user's transactions are not included in the summary."""
        # Arrange
        url = '/api/auth/accounts/wallet-summary/'
        # Act
        response = self.client.get(url, {'start': self.period_start, 'end': self.period_end})
        # Assert – other user had 999.00 income; authenticated user had 500.00
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertAlmostEqual(response.data['income'], 500.0)

    def test_wallet_summary_invalid_date_format(self):
        """Invalid date format returns 400."""
        # Arrange
        url = '/api/auth/accounts/wallet-summary/'
        # Act
        response = self.client.get(url, {'start': 'not-a-date', 'end': '2024-01-31'})
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_wallet_summary_partial_date_params(self):
        """Providing only start or only end date returns 400."""
        # Arrange
        url = '/api/auth/accounts/wallet-summary/'
        # Act – only start provided
        response = self.client.get(url, {'start': self.period_start})
        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

