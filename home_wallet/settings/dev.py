"""
Development settings
"""
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']

# Development-only apps
INSTALLED_APPS += [
    'django_extensions',
]

# Disable HTTPS requirements in development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email - Use console backend in development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
