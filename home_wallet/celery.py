import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'home_wallet.settings.dev')

app = Celery('home_wallet')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
