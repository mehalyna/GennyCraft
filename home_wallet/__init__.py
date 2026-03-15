"""
Home Wallet Django Application
Personal finance management system
"""

__version__ = '0.1.0'

# Celery app configuration
from .celery import app as celery_app

__all__ = ('celery_app',)
