from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    """Signal handler for user creation."""
    if created:
        # TODO: Send welcome email
        # TODO: Create default categories for the user
        pass
