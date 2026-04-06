"""
Caching configuration for GennyCraft
"""
import environ
import sys

env = environ.Env()

# Check if we're running tests or if django_redis is available
IS_TESTING = 'pytest' in sys.modules or 'test' in sys.argv

try:
    if not IS_TESTING:
        import django_redis
        USE_REDIS = True
    else:
        USE_REDIS = False
except ImportError:
    USE_REDIS = False

# Multi-tier caching strategy
if USE_REDIS:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': env('REDIS_URL', default='redis://redis:6379/1'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'retry_on_timeout': True,
                    'socket_connect_timeout': 5,
                    'socket_timeout': 5,
                },
                'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
                'PARSER_CLASS': 'redis.connection.HiredisParser',
            },
            'KEY_PREFIX': 'gennycraft',
            'TIMEOUT': 300,  # 5 minutes default
        },
        
        # Separate cache for sessions (higher TTL)
        'sessions': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': env('REDIS_URL', default='redis://redis:6379/2'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 20,
                },
            },
            'KEY_PREFIX': 'session',
            'TIMEOUT': 86400,  # 24 hours
        },
        
        # Cache for expensive reports (longer TTL)
        'reports': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': env('REDIS_URL', default='redis://redis:6379/3'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            },
            'KEY_PREFIX': 'report',
            'TIMEOUT': 3600,  # 1 hour
        },
    }

    # Use Redis for sessions
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
    SESSION_CACHE_ALIAS = 'sessions'
else:
    # Fallback to local memory cache for testing or when Redis is unavailable
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'default-cache',
            'TIMEOUT': 300,
        },
        'sessions': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'session-cache',
            'TIMEOUT': 86400,
        },
        'reports': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'report-cache',
            'TIMEOUT': 3600,
        },
    }
    
    # Use database sessions as fallback
    SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Cache configuration for query results
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 300
CACHE_MIDDLEWARE_KEY_PREFIX = 'middleware'
