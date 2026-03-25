---
applyTo: '**/test_*.py,**/*_test.py'
description: 'Testing standards for GennyCraft'
---

# Testing Standards

## Framework
- pytest + pytest-django
- factory_boy for object creation, never raw ORM
- APIClient for all endpoint tests

## Required scenarios for every endpoint
1. Authenticated owner access → 200
2. Unauthenticated request → 401
3. Access to another user's data → 403
4. Invalid input data → 400

## Test structure
def test_[action]_[resource]_[scenario]():
    """One line describing what this test verifies."""
    # Arrange
    # Act  
    # Assert

## Never
- Never use production database in tests
- Never hardcode user IDs or primary keys
- Never test implementation — test behavior