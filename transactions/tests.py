import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import timedelta
import io
import csv

from .models import Transaction, RecurringInstance
from categories.models import Category
from accounts.models import Account

User = get_user_model()


# ============================================================================
# MODEL TESTS
# ============================================================================

@pytest.mark.django_db
class TestTransactionModel:
    """Test cases for Transaction model."""

    def test_create_transaction_with_all_fields(self):
        """Test creating a transaction with all fields."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='testpass123')
        account = Account.objects.create(user=user, name='Main Wallet', currency='USD')
        category = Category.objects.create(owner=user, name='Groceries', type=Category.TYPE_EXPENSE)
        
        # Act
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('50.00'),
            currency='USD',
            date=timezone.now(),
            category=category,
            title='Weekly groceries',
            note='Bought milk and bread'
        )
        
        # Assert
        assert transaction.amount == Decimal('50.00')
        assert transaction.owner == user
        assert transaction.account == account
        assert transaction.category == category
        assert transaction.is_deleted is False

    def test_soft_delete_transaction(self):
        """Test soft delete marks transaction as deleted without removing it."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='testpass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('10.00'),
            date=timezone.now(),
            category=category
        )
        
        # Act
        transaction.delete()
        
        # Assert
        transaction.refresh_from_db()
        assert transaction.is_deleted is True
        assert Transaction.objects.filter(pk=transaction.pk).exists()

    def test_transaction_str_representation_income(self):
        """Test string representation for income transaction."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='testpass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Salary', type=Category.TYPE_INCOME)
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_INCOME,
            amount=Decimal('3000.00'),
            currency='USD',
            date=timezone.now(),
            category=category,
            title='Monthly salary'
        )
        
        # Act & Assert
        assert '+USD 3000.00' in str(transaction)

    def test_transaction_str_representation_expense(self):
        """Test string representation for expense transaction."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='testpass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('25.50'),
            currency='USD',
            date=timezone.now(),
            category=category
        )
        
        # Act & Assert
        assert '-USD 25.50' in str(transaction)


# ============================================================================
# API TESTS - AUTHENTICATION
# ============================================================================

@pytest.mark.django_db
class TestTransactionAPIAuthentication:
    """Test authentication and authorization for transaction endpoints."""

    def test_list_transactions_unauthenticated_returns_401(self):
        """Test listing transactions without authentication returns 401."""
        # Arrange
        client = APIClient()
        
        # Act
        response = client.get('/api/transactions/')
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_transaction_unauthenticated_returns_401(self):
        """Test creating transaction without authentication returns 401."""
        # Arrange
        client = APIClient()
        data = {
            'type': 'expense',
            'amount': '50.00',
            'date': timezone.now().isoformat(),
        }
        
        # Act
        response = client.post('/api/transactions/', data)
        
        # Assert
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_retrieve_another_users_transaction_returns_404(self):
        """Test accessing another user's transaction returns 404."""
        # Arrange
        user1 = User.objects.create_user(email='user1@example.com', password='pass123')
        user2 = User.objects.create_user(email='user2@example.com', password='pass123')
        account1 = Account.objects.create(user=user1, name='Wallet 1')
        category1 = Category.objects.create(owner=user1, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user1,
            account=account1,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('100.00'),
            date=timezone.now(),
            category=category1
        )
        
        client = APIClient()
        client.force_authenticate(user=user2)
        
        # Act
        response = client.get(f'/api/transactions/{transaction.id}/')
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_another_users_transaction_returns_404(self):
        """Test updating another user's transaction returns 404."""
        # Arrange
        user1 = User.objects.create_user(email='user1@example.com', password='pass123')
        user2 = User.objects.create_user(email='user2@example.com', password='pass123')
        account1 = Account.objects.create(user=user1, name='Wallet 1')
        category1 = Category.objects.create(owner=user1, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user1,
            account=account1,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('100.00'),
            date=timezone.now(),
            category=category1
        )
        
        client = APIClient()
        client.force_authenticate(user=user2)
        
        # Act
        response = client.patch(f'/api/transactions/{transaction.id}/', {'amount': '200.00'})
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_another_users_transaction_returns_404(self):
        """Test deleting another user's transaction returns 404."""
        # Arrange
        user1 = User.objects.create_user(email='user1@example.com', password='pass123')
        user2 = User.objects.create_user(email='user2@example.com', password='pass123')
        account1 = Account.objects.create(user=user1, name='Wallet 1')
        category1 = Category.objects.create(owner=user1, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user1,
            account=account1,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('100.00'),
            date=timezone.now(),
            category=category1
        )
        
        client = APIClient()
        client.force_authenticate(user=user2)
        
        # Act
        response = client.delete(f'/api/transactions/{transaction.id}/')
        
        # Assert
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ============================================================================
# API TESTS - CRUD OPERATIONS
# ============================================================================

@pytest.mark.django_db
class TestTransactionAPICRUD:
    """Test CRUD operations for transactions."""

    def test_list_transactions_returns_only_user_transactions(self):
        """Test listing returns only authenticated user's transactions."""
        # Arrange
        user1 = User.objects.create_user(email='user1@example.com', password='pass123')
        user2 = User.objects.create_user(email='user2@example.com', password='pass123')
        
        account1 = Account.objects.create(user=user1, name='Wallet 1')
        account2 = Account.objects.create(user=user2, name='Wallet 2')
        
        category1 = Category.objects.create(owner=user1, name='Food', type=Category.TYPE_EXPENSE)
        category2 = Category.objects.create(owner=user2, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user1, account=account1, type='expense', amount=Decimal('50'), date=timezone.now(), category=category1)
        Transaction.objects.create(owner=user1, account=account1, type='income', amount=Decimal('100'), date=timezone.now(), category=category1)
        Transaction.objects.create(owner=user2, account=account2, type='expense', amount=Decimal('75'), date=timezone.now(), category=category2)
        
        client = APIClient()
        client.force_authenticate(user=user1)
        
        # Act
        response = client.get('/api/transactions/')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_list_transactions_excludes_deleted(self):
        """Test listing excludes soft-deleted transactions."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=category)
        deleted = Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('100'), date=timezone.now(), category=category)
        deleted.is_deleted = True
        deleted.save()
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_create_transaction_success(self):
        """Test creating a transaction successfully."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet', currency='USD')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'currency': 'USD',
            'date': timezone.now().isoformat(),
            'category': category.id,
            'title': 'Grocery shopping',
            'note': 'Weekly groceries'
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['amount'] == '50.00'
        assert response.data['title'] == 'Grocery shopping'
        assert response.data['type'] == Transaction.TYPE_EXPENSE
        
        # Verify in database
        transaction = Transaction.objects.get(pk=response.data['id'])
        assert transaction.owner == user

    def test_retrieve_transaction_success(self):
        """Test retrieving a specific transaction."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('75.50'),
            date=timezone.now(),
            category=category,
            title='Restaurant'
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get(f'/api/transactions/{transaction.id}/')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == transaction.id
        assert response.data['amount'] == '75.50'
        assert response.data['title'] == 'Restaurant'

    def test_update_transaction_success(self):
        """Test updating a transaction."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('50.00'),
            date=timezone.now(),
            category=category,
            title='Original Title'
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.patch(
            f'/api/transactions/{transaction.id}/',
            {'title': 'Updated Title', 'amount': '75.00'},
            format='json'
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'
        assert response.data['amount'] == '75.00'
        
        transaction.refresh_from_db()
        assert transaction.title == 'Updated Title'
        assert transaction.amount == Decimal('75.00')

    def test_delete_transaction_performs_soft_delete(self):
        """Test deleting a transaction performs soft delete."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type=Transaction.TYPE_EXPENSE,
            amount=Decimal('50.00'),
            date=timezone.now(),
            category=category
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.delete(f'/api/transactions/{transaction.id}/')
        
        # Assert
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        transaction.refresh_from_db()
        assert transaction.is_deleted is True
        assert Transaction.objects.filter(pk=transaction.pk).exists()


# ============================================================================
# API TESTS - VALIDATION
# ============================================================================

@pytest.mark.django_db
class TestTransactionAPIValidation:
    """Test validation rules for transactions."""

    def test_create_transaction_with_zero_amount_fails(self):
        """Test creating transaction with zero amount fails."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '0.00',
            'date': timezone.now().isoformat(),
            'category': category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'amount' in response.data

    def test_create_transaction_with_negative_amount_fails(self):
        """Test creating transaction with negative amount fails."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '-50.00',
            'date': timezone.now().isoformat(),
            'category': category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'amount' in response.data

    def test_create_transaction_with_far_future_date_fails(self):
        """Test creating transaction with date too far in future fails."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        far_future = timezone.now() + timedelta(days=400)
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'date': far_future.isoformat(),
            'category': category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'date' in response.data

    def test_create_expense_with_income_only_category_fails(self):
        """Test creating expense with income-only category fails validation."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        income_category = Category.objects.create(owner=user, name='Salary', type=Category.TYPE_INCOME)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'date': timezone.now().isoformat(),
            'category': income_category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'category' in response.data

    def test_create_income_with_expense_only_category_fails(self):
        """Test creating income with expense-only category fails validation."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        expense_category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_INCOME,
            'amount': '1000.00',
            'date': timezone.now().isoformat(),
            'category': expense_category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'category' in response.data

    def test_create_transaction_with_both_type_category_succeeds(self):
        """Test creating any transaction with 'both' type category succeeds."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        both_category = Category.objects.create(owner=user, name='Transfer', type=Category.TYPE_BOTH)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'date': timezone.now().isoformat(),
            'category': both_category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_transaction_with_another_users_account_fails(self):
        """Test creating transaction with another user's account fails."""
        # Arrange
        user1 = User.objects.create_user(email='user1@example.com', password='pass123')
        user2 = User.objects.create_user(email='user2@example.com', password='pass123')
        account2 = Account.objects.create(user=user2, name='User2 Wallet')
        category1 = Category.objects.create(owner=user1, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user1)
        
        data = {
            'account': account2.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'date': timezone.now().isoformat(),
            'category': category1.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'account' in response.data

    def test_create_transaction_with_another_users_category_fails(self):
        """Test creating transaction with another user's category fails."""
        # Arrange
        user1 = User.objects.create_user(email='user1@example.com', password='pass123')
        user2 = User.objects.create_user(email='user2@example.com', password='pass123')
        account1 = Account.objects.create(user=user1, name='User1 Wallet')
        category2 = Category.objects.create(owner=user2, name='Food', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user1)
        
        data = {
            'account': account1.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '50.00',
            'date': timezone.now().isoformat(),
            'category': category2.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'category' in response.data

    def test_create_transaction_with_global_category_succeeds(self):
        """Test creating transaction with global category succeeds."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        global_category = Category.objects.create(owner=None, name='Utilities', type=Category.TYPE_EXPENSE)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        data = {
            'account': account.id,
            'type': Transaction.TYPE_EXPENSE,
            'amount': '100.00',
            'date': timezone.now().isoformat(),
            'category': global_category.id
        }
        
        # Act
        response = client.post('/api/transactions/', data, format='json')
        
        # Assert
        assert response.status_code == status.HTTP_201_CREATED


# ============================================================================
# API TESTS - FILTERING
# ============================================================================

@pytest.mark.django_db
class TestTransactionAPIFiltering:
    """Test filtering functionality for transactions."""

    def test_filter_transactions_by_type_expense(self):
        """Test filtering transactions by expense type."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_BOTH)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=category)
        Transaction.objects.create(owner=user, account=account, type='income', amount=Decimal('100'), date=timezone.now(), category=category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('75'), date=timezone.now(), category=category)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/?type=expense')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_filter_transactions_by_category(self):
        """Test filtering transactions by category."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        food_category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        transport_category = Category.objects.create(owner=user, name='Transport', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=food_category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('100'), date=timezone.now(), category=transport_category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('75'), date=timezone.now(), category=food_category)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get(f'/api/transactions/?category={food_category.id}')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_filter_transactions_by_date_range(self):
        """Test filtering transactions by date range."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        now = timezone.now()
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=now - timedelta(days=10), category=category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('100'), date=now - timedelta(days=5), category=category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('75'), date=now, category=category)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act - using date format without microseconds
        # Add 1 second to date_to to ensure inclusive filtering (microseconds issue)
        date_from = (now - timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%S')
        date_to = (now + timedelta(seconds=1)).strftime('%Y-%m-%dT%H:%M:%S')
        response = client.get(f'/api/transactions/?date_from={date_from}&date_to={date_to}')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_filter_transactions_by_amount_range(self):
        """Test filtering transactions by amount range."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('25'), date=timezone.now(), category=category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=category)
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('100'), date=timezone.now(), category=category)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/?amount_min=40&amount_max=80')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_search_transactions_by_title(self):
        """Test searching transactions by title."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=category, title='Grocery store')
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('100'), date=timezone.now(), category=category, title='Restaurant')
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('75'), date=timezone.now(), category=category, title='Grocery market')
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/?search=grocery')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 2

    def test_search_transactions_by_note(self):
        """Test searching transactions by note field."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=category, note='Bought milk')
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('100'), date=timezone.now(), category=category, note='Lunch meeting')
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/?search=milk')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1


# ============================================================================
# API TESTS - EXPORT
# ============================================================================

@pytest.mark.django_db
class TestTransactionAPIExport:
    """Test CSV export functionality."""

    def test_export_transactions_to_csv(self):
        """Test exporting transactions to CSV format."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(
            owner=user,
            account=account,
            type='expense',
            amount=Decimal('50.00'),
            date=timezone.now(),
            category=category,
            title='Groceries'
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/export/')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'text/csv'
        assert 'attachment' in response['Content-Disposition']
        
        # Verify CSV content
        content = b''.join(response.streaming_content).decode('utf-8')
        csv_reader = csv.reader(io.StringIO(content))
        rows = list(csv_reader)
        
        assert len(rows) == 2  # Header + 1 data row
        assert rows[0] == ['Date', 'Type', 'Amount', 'Currency', 'Category', 'Title', 'Note', 'Created At']
        assert 'Groceries' in rows[1]

    def test_export_respects_filters(self):
        """Test export respects query filters."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        Transaction.objects.create(owner=user, account=account, type='expense', amount=Decimal('50'), date=timezone.now(), category=category)
        Transaction.objects.create(owner=user, account=account, type='income', amount=Decimal('100'), date=timezone.now(), category=category)
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.get('/api/transactions/export/?type=expense')
        
        # Assert
        content = b''.join(response.streaming_content).decode('utf-8')
        csv_reader = csv.reader(io.StringIO(content))
        rows = list(csv_reader)
        
        assert len(rows) == 2  # Header + 1 expense row


# ============================================================================
# API TESTS - ATTACHMENTS
# ============================================================================

@pytest.mark.django_db
class TestTransactionAPIAttachments:
    """Test file attachment functionality."""

    def test_attach_file_to_transaction(self):
        """Test attaching a file to transaction."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type='expense',
            amount=Decimal('50'),
            date=timezone.now(),
            category=category
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        file_content = b'fake image content'
        uploaded_file = SimpleUploadedFile('receipt.jpg', file_content, content_type='image/jpeg')
        
        # Act
        response = client.post(
            f'/api/transactions/{transaction.id}/attach_file/',
            {'file': uploaded_file},
            format='multipart'
        )
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data['attachment'] is not None
        
        transaction.refresh_from_db()
        assert transaction.attachment.name != ''

    def test_attach_file_without_file_fails(self):
        """Test attaching without providing file fails."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type='expense',
            amount=Decimal('50'),
            date=timezone.now(),
            category=category
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.post(f'/api/transactions/{transaction.id}/attach_file/', {})
        
        # Assert
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'No file provided' in response.data['detail']

    def test_remove_attachment_from_transaction(self):
        """Test removing attachment from transaction."""
        # Arrange
        user = User.objects.create_user(email='test@example.com', password='pass123')
        account = Account.objects.create(user=user, name='Main Wallet')
        category = Category.objects.create(owner=user, name='Food', type=Category.TYPE_EXPENSE)
        
        file_content = b'fake image content'
        uploaded_file = SimpleUploadedFile('receipt.jpg', file_content)
        
        transaction = Transaction.objects.create(
            owner=user,
            account=account,
            type='expense',
            amount=Decimal('50'),
            date=timezone.now(),
            category=category,
            attachment=uploaded_file
        )
        
        client = APIClient()
        client.force_authenticate(user=user)
        
        # Act
        response = client.delete(f'/api/transactions/{transaction.id}/remove_attachment/')
        
        # Assert
        assert response.status_code == status.HTTP_200_OK
        
        transaction.refresh_from_db()
        assert not transaction.attachment
