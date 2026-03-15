"""
ASGI config for home_wallet project.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'home_wallet.settings.prod')

application = get_asgi_application()
