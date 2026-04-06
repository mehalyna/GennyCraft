"""
Cache invalidation utilities for GennyCraft
"""
from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


def invalidate_user_caches(user_id):
    """
    Invalidate all cached data for a specific user.
    Called when user's transactions are modified.
    """
    patterns = [
        f'summary:{user_id}:*',
        f'category_breakdown:{user_id}:*',
        f'report:{user_id}:*',
    ]
    
    # Note: This requires django-redis for pattern deletion
    # For basic cache backend, you'd need to track keys explicitly
    try:
        cache.delete_many(patterns)
        logger.info(f"Invalidated caches for user {user_id}")
    except Exception as e:
        logger.warning(f"Cache invalidation failed for user {user_id}: {e}")


# Signal handlers for automatic cache invalidation
@receiver([post_save, post_delete], sender='transactions.Transaction')
def invalidate_transaction_cache(sender, instance, **kwargs):
    """Invalidate user's cached reports when transactions change."""
    if hasattr(instance, 'owner_id'):
        invalidate_user_caches(instance.owner_id)


@receiver([post_save, post_delete], sender='accounts.Account')
def invalidate_account_cache(sender, instance, **kwargs):
    """Invalidate user's cached data when accounts change."""
    if hasattr(instance, 'user_id'):
        invalidate_user_caches(instance.user_id)
