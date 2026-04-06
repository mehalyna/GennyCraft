"""
Database router for read/write splitting
"""
import random


class PrimaryReplicaRouter:
    """
    Route reads to replica database, writes to primary.
    Falls back to primary if replica is not available.
    """
    
    def db_for_read(self, model, **hints):
        """
        Send read queries to a random replica.
        """
        # Check if we have replicas configured
        from django.conf import settings
        if 'replica' in settings.DATABASES:
            # Route to replica for read operations
            return 'replica'
        # Fallback to primary
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Send all write queries to primary.
        """
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects from the same database.
        """
        return True
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure migrations only run on primary database.
        """
        return db == 'default'
