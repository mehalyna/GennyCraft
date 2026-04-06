"""
Prometheus metrics for monitoring GennyCraft performance
"""
import sys
import time
from django.conf import settings

# Check if prometheus_client is available
IS_TESTING = 'pytest' in sys.modules or 'test' in sys.argv

try:
    if not IS_TESTING:
        from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
        PROMETHEUS_AVAILABLE = True
    else:
        PROMETHEUS_AVAILABLE = False
except ImportError:
    PROMETHEUS_AVAILABLE = False

# Dummy classes for when Prometheus is not available
if not PROMETHEUS_AVAILABLE:
    class DummyMetric:
        def __init__(self, *args, **kwargs):
            pass
        
        def inc(self, *args, **kwargs):
            pass
        
        def observe(self, *args, **kwargs):
            pass
        
        def set(self, *args, **kwargs):
            pass
        
        def labels(self, *args, **kwargs):
            return self
    
    class CollectorRegistry:
        pass
    
    Counter = Histogram = Gauge = DummyMetric

# Create registry
registry = CollectorRegistry()

# Request metrics
http_requests_total = Counter(
    'gennycraft_http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status'],
    registry=registry
)

http_request_duration_seconds = Histogram(
    'gennycraft_http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    registry=registry
)

# Database metrics
db_query_duration_seconds = Histogram(
    'gennycraft_db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type'],
    registry=registry
)

db_connections_active = Gauge(
    'gennycraft_db_connections_active',
    'Active database connections',
    registry=registry
)

# Cache metrics
cache_hits_total = Counter(
    'gennycraft_cache_hits_total',
    'Total cache hits',
    ['cache_type'],
    registry=registry
)

cache_misses_total = Counter(
    'gennycraft_cache_misses_total',
    'Total cache misses',
    ['cache_type'],
    registry=registry
)

# Business metrics
transactions_created_total = Counter(
    'gennycraft_transactions_created_total',
    'Total transactions created',
    ['type', 'user_tier'],
    registry=registry
)

active_users_total = Gauge(
    'gennycraft_active_users_total',
    'Total active users',
    registry=registry
)


class MetricsMiddleware:
    """
    Middleware to track HTTP request metrics.
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        
        # Track metrics
        endpoint = request.path
        method = request.method
        status = response.status_code
        
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status=status
        ).inc()
        
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
        
        return response
