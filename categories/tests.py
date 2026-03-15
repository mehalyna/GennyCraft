from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test cases for Category model."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_create_category(self):
        """Test creating a category."""
        category = Category.objects.create(
            owner=self.user,
            name='Groceries',
            type=Category.TYPE_EXPENSE
        )
        self.assertEqual(category.name, 'Groceries')
        self.assertEqual(category.owner, self.user)
        self.assertFalse(category.is_global())

    def test_global_category(self):
        """Test creating a global category."""
        category = Category.objects.create(
            name='Salary',
            type=Category.TYPE_INCOME
        )
        self.assertTrue(category.is_global())


class CategoryAPITest(APITestCase):
    """Test cases for Category API."""

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_list_categories(self):
        """Test listing categories."""
        response = self.client.get('/api/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_category(self):
        """Test creating a category."""
        data = {
            'name': 'Transport',
            'type': Category.TYPE_EXPENSE,
            'color': '#FF5733'
        }
        response = self.client.post('/api/categories/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Transport')
