from django.apps import AppConfig


class HomeWalletConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'home_wallet'
    
    def ready(self):
        """Import signal handlers when app is ready."""
        try:
            import home_wallet.cache_utils  # noqa
        except ImportError:
            pass
