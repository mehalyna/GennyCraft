"""
Database configuration with connection pooling for production
"""
import environ

env = environ.Env()

# PostgreSQL with connection pooling
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='home_wallet'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_HOST', default='db'),
        'PORT': env('DB_PORT', default='5432'),
        'ATOMIC_REQUESTS': True,  # Wrap each request in a transaction
        'CONN_MAX_AGE': 600,      # Connection pooling - 10 minutes
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c statement_timeout=30000',  # 30s query timeout
            'keepalives': 1,
            'keepalives_idle': 30,
            'keepalives_interval': 10,
            'keepalives_count': 5,
        },
    },
}

# Read replicas configuration (optional - enable in production)
if env.bool('USE_READ_REPLICAS', default=False):
    DATABASES['replica'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DB_NAME', default='home_wallet'),
        'USER': env('DB_USER', default='postgres'),
        'PASSWORD': env('DB_PASSWORD', default='postgres'),
        'HOST': env('DB_REPLICA_HOST', default='db-replica'),
        'PORT': env('DB_PORT', default='5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c default_transaction_read_only=on',  # Read-only
        },
    }
    
    DATABASE_ROUTERS = ['home_wallet.db_router.PrimaryReplicaRouter']

# PgBouncer configuration (if using external pooler)
# Set CONN_MAX_AGE = None when using PgBouncer
if env.bool('USE_PGBOUNCER', default=False):
    DATABASES['default']['CONN_MAX_AGE'] = None
    DATABASES['default']['DISABLE_SERVER_SIDE_CURSORS'] = True
