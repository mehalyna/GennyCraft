"""
WSGI config for home_wallet project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'home_wallet.settings.prod')

application = get_wsgi_application()
