from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime, timedelta

from transactions.models import Transaction
from .models import Account
from .serializers import (
    AccountSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


class AccountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing wallet accounts.
    Users can only access their own accounts.
    """
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter accounts to only show the authenticated user's accounts."""
        return Account.objects.filter(user=self.request.user).select_related('user')
    
    def perform_create(self, serializer):
        """Automatically set the user to the authenticated user."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='wallet-summary')
    def wallet_summary(self, request):
        """
        MyWallet: returns active accounts with balances and income/outcome totals
        for the chosen period.

        Query params:
          start (YYYY-MM-DD) – period start date (defaults to first day of current month)
          end   (YYYY-MM-DD) – period end date   (defaults to last day of current month)
        """
        user = request.user
        start_param = request.query_params.get('start')
        end_param = request.query_params.get('end')

        # Determine date range, defaulting to the current calendar month
        if bool(start_param) != bool(end_param):
            return Response(
                {'detail': 'Both start and end date must be provided together.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if start_param and end_param:
            try:
                start_naive = datetime.fromisoformat(start_param)
                end_naive = datetime.fromisoformat(end_param)
                start = timezone.make_aware(start_naive) if timezone.is_naive(start_naive) else start_naive
                end = timezone.make_aware(end_naive) if timezone.is_naive(end_naive) else end_naive
            except ValueError:
                return Response(
                    {'detail': 'Invalid date format. Use YYYY-MM-DD.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            now = timezone.now()
            start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end = (start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)

        # Aggregate income and outcome for the period (scoped to this user only)
        transactions = Transaction.objects.filter(
            owner=user,
            is_deleted=False,
            date__gte=start,
            date__lte=end,
        )

        income = transactions.filter(type=Transaction.TYPE_INCOME).aggregate(
            total=Sum('amount')
        )['total'] or 0

        outcome = transactions.filter(type=Transaction.TYPE_EXPENSE).aggregate(
            total=Sum('amount')
        )['total'] or 0

        # Active accounts with their current balances
        accounts = self.get_queryset().filter(is_active=True)

        return Response({
            'period': {
                'start': start.date().isoformat(),
                'end': end.date().isoformat(),
            },
            'accounts': AccountSerializer(accounts, many=True).data,
            'income': float(income),
            'outcome': float(outcome),
            'net_change': float(income) - float(outcome),
        })


class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class PasswordChangeView(APIView):
    """Change user password."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    """Request password reset token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # TODO: Implement email sending logic with reset token
        # For now, return success message
        return Response({
            'detail': 'If the email exists, a password reset link has been sent.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # TODO: Implement token validation and password reset logic
        return Response({
            'detail': 'Password has been reset successfully.'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout endpoint (blacklist refresh token)."""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
