"""
Health check endpoint with dependency verification
"""
from django.http import JsonResponse
from django.urls import path
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import time
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Basic liveness probe - just checks if the app is running.
    Use for Kubernetes livenessProbe.
    """
    return JsonResponse({
        'status': 'healthy',
        'timestamp': time.time()
    })


def readiness_check(request):
    """
    Comprehensive readiness probe - checks all dependencies.
    Use for Kubernetes readinessProbe and load balancer health checks.
    Returns 200 if ready, 503 if not ready.
    """
    checks = {
        'database': False,
        'cache': False,
        'storage': False,
    }
    
    overall_healthy = True
    
    # 1. Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        checks['database'] = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        overall_healthy = False
    
    # 2. Cache check (if configured)
    try:
        if hasattr(settings, 'CACHES') and 'default' in settings.CACHES:
            cache_key = 'health_check_test'
            cache.set(cache_key, 'ok', timeout=10)
            cache_value = cache.get(cache_key)
            checks['cache'] = (cache_value == 'ok')
            if not checks['cache']:
                overall_healthy = False
        else:
            checks['cache'] = 'not_configured'
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        checks['cache'] = False
        overall_healthy = False
    
    # 3. Storage check (basic filesystem check)
    try:
        import os
        media_root = settings.MEDIA_ROOT
        checks['storage'] = os.path.exists(media_root) and os.access(media_root, os.W_OK)
        if not checks['storage']:
            overall_healthy = False
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        checks['storage'] = False
        overall_healthy = False
    
    status_code = 200 if overall_healthy else 503
    
    return JsonResponse({
        'status': 'healthy' if overall_healthy else 'unhealthy',
        'checks': checks,
        'timestamp': time.time()
    }, status=status_code)


urlpatterns = [
    path('health/', health_check, name='health-liveness'),
    path('ready/', readiness_check, name='health-readiness'),
]
