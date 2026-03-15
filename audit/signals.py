from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from transactions.models import Transaction
from categories.models import Category
from .models import AuditLog


def get_client_ip(request):
    """Extract client IP from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def create_audit_log(user, action, instance, changes=None):
    """Helper to create audit log entry."""
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=instance.__class__.__name__,
        object_id=str(instance.pk),
        changes=changes or {},
    )


@receiver(post_save, sender=Transaction)
def transaction_audit(sender, instance, created, **kwargs):
    """Audit log for transaction changes."""
    if created:
        create_audit_log(
            instance.owner,
            AuditLog.ACTION_CREATE,
            instance,
            {'type': instance.type, 'amount': str(instance.amount)}
        )


@receiver(post_save, sender=Category)
def category_audit(sender, instance, created, **kwargs):
    """Audit log for category changes."""
    if created and instance.owner:
        create_audit_log(
            instance.owner,
            AuditLog.ACTION_CREATE,
            instance,
            {'name': instance.name, 'type': instance.type}
        )
