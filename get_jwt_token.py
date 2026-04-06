#!/usr/bin/env python
"""
Quick script to get JWT token for testing the gennycraft MCP server.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'home_wallet.settings.dev')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Get or create test user
email = sys.argv[1] if len(sys.argv) > 1 else "test@example.com"
password = sys.argv[2] if len(sys.argv) > 2 else "testpass123"

user, created = User.objects.get_or_create(email=email)
if created:
    user.set_password(password)
    user.save()
    print(f"✓ Created user: {email}")
else:
    print(f"✓ User exists: {email}")

# Generate JWT token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print("\n" + "="*60)
print("JWT ACCESS TOKEN:")
print("="*60)
print(access_token)
print("="*60)

# Save token to file for MCP server
token_file = ".gennycraft-token"
with open(token_file, "w") as f:
    f.write(access_token)

print(f"\n✓ Token saved to {token_file}")
print("  MCP server will read from this file automatically")
print("="*60)
