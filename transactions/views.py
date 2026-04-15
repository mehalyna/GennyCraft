from rest_framework import viewsets, permissions, status
from rest_framework.decorators import APIView, action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.http import HttpResponse
from django.utils import timezone
from django.conf import settings
from django.db.models import QuerySet, Q
import csv

from .models import Transaction
from .serializers import TransactionSerializer, TransactionListSerializer
from .filters import TransactionFilter
from .permissions import IsOwner


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet for Transaction CRUD operations."""
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = TransactionFilter

    def get_queryset(self) -> QuerySet[Transaction]: # type: ignore
        """Return only user's own non-deleted transactions with optimized joins."""
        queryset = Transaction.objects.filter(
            owner=self.request.user,
            is_deleted=False
        ).select_related('category', 'owner', 'account')
        
        # For list views, only fetch necessary fields to reduce data transfer
        if self.action == 'list':
            queryset = queryset.only(
                'id', 'type', 'amount', 'currency', 'date', 'title',
                'is_recurring', 'created_at',
                'category__name', 'category__icon',
                'account__name'
            )
        
        return queryset

    def get_serializer_class(self) -> type[TransactionSerializer]: # type: ignore
        """Use lighter serializer for list view."""
        if self.action == 'list':
            return TransactionListSerializer # type: ignore
        return TransactionSerializer

    def perform_destroy(self, instance):
        """Soft delete transaction."""
        instance.is_deleted = True
        instance.save()

    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export transactions to CSV using streaming to handle large datasets.
        Prevents memory exhaustion for users with many transactions.
        """
        import csv
        from django.http import StreamingHttpResponse
        
        class Echo:
            """Echo object that writes to a pseudo-file."""
            def write(self, value):
                return value
        
        def iter_transactions():
            """Generator to yield CSV rows."""
            pseudo_buffer = Echo()
            writer = csv.writer(pseudo_buffer)
            
            # Header row
            yield writer.writerow([
                'Date', 'Type', 'Amount', 'Currency', 'Category',
                'Title', 'Note', 'Created At'
            ])
            
            # Data rows - iterate in chunks
            queryset = self.filter_queryset(self.get_queryset())
            queryset = queryset.select_related('category').iterator(chunk_size=500)
            
            for transaction in queryset:
                yield writer.writerow([
                    transaction.date.strftime('%Y-%m-%d %H:%M:%S'),
                    transaction.type,
                    str(transaction.amount),
                    transaction.currency,
                    transaction.category.name,
                    transaction.title,
                    transaction.note,
                    transaction.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                ])
        
        response = StreamingHttpResponse(
            iter_transactions(),
            content_type='text/csv',
        )
        response['Content-Disposition'] = \
            f'attachment; filename="transactions_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        return response

    @action(detail=False, methods=['post'])
    def import_csv(self, request):
        """Import transactions from CSV."""
        # TODO: Implement CSV import with validation
        return Response({
            'detail': 'CSV import functionality to be implemented.'
        }, status=status.HTTP_501_NOT_IMPLEMENTED)

    @action(detail=True, methods=['post'])
    def attach_file(self, request, pk=None):
        """Attach a file to a transaction."""
        transaction = self.get_object()
        file = request.FILES.get('file')

        if not file:
            return Response(
                {'detail': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file size
        max_size = getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 5242880)
        if file.size > max_size:
            return Response(
                {'detail': f'File size exceeds {max_size / 1024 / 1024}MB limit.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate file type
        allowed_types = getattr(settings, 'ALLOWED_ATTACHMENT_TYPES', [])
        if allowed_types and file.content_type not in allowed_types:
            return Response(
                {'detail': f'File type {file.content_type} is not allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        transaction.attachment = file
        transaction.save()

        serializer = self.get_serializer(transaction)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def remove_attachment(self, request, pk=None):
        """Remove attachment from transaction."""
        transaction = self.get_object()
        if transaction.attachment:
            transaction.attachment.delete()
            transaction.save()

        return Response({'detail': 'Attachment removed.'})

