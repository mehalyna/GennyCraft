from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations."""
    serializer_class = CategorySerializer

    def get_permissions(self):
        """Allow read-only access for unauthenticated users, auth required for modifications."""
        if self.action in ['list', 'retrieve', 'income', 'expense']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        """Return global categories and user's own categories."""
        if self.request.user.is_authenticated:
            user = self.request.user
            return Category.objects.filter(
                Q(owner=user) | Q(owner__isnull=True),
                is_active=True
            ).distinct()
        else:
            # For unauthenticated users, only show global categories
            return Category.objects.filter(
                owner__isnull=True,
                is_active=True
            )

    def perform_destroy(self, instance):
        """Soft delete instead of hard delete."""
        if instance.is_global():
            return Response({'detail': 'Cannot delete global categories.'}, status=400)
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'])
    def income(self, request):
        """Get categories for income."""
        categories = self.get_queryset().filter(
            Q(type=Category.TYPE_INCOME) | Q(type=Category.TYPE_BOTH)
        )
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expense(self, request):
        """Get categories for expenses."""
        categories = self.get_queryset().filter(
            Q(type=Category.TYPE_EXPENSE) | Q(type=Category.TYPE_BOTH)
        )
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)
