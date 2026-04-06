"""
Prometheus metrics endpoint
"""
import sys
from django.http import HttpResponse

# Check if prometheus_client is available
IS_TESTING = 'pytest' in sys.modules or 'test' in sys.argv

try:
    if not IS_TESTING:
        from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
        PROMETHEUS_AVAILABLE = True
    else:
        PROMETHEUS_AVAILABLE = False
except ImportError:
    PROMETHEUS_AVAILABLE = False

from .metrics import registry


def metrics_view(request):
    """
    Expose Prometheus metrics endpoint.
    Should be protected or only accessible internally.
    """
    if not PROMETHEUS_AVAILABLE:
        return HttpResponse(
            "Prometheus metrics not available (prometheus_client not installed)",
            content_type="text/plain",
            status=503
        )
    
    metrics = generate_latest(registry)
    return HttpResponse(metrics, content_type=CONTENT_TYPE_LATEST)
