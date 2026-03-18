## Project: GennyCraft
Personal finance and wallet tracking application.

## Stack
- Django + Django REST Framework
- PostgreSQL
- JWT authentication
- pytest for testing

## Architecture
- Apps: accounts, transactions, categories, 
        home_wallet, reports, audit, logs
- Views: ViewSets only, never APIView
- URLs: registered via DefaultRouter

## Security rules (critical)
- Users must NEVER access another user's accounts 
  or transactions
- Always filter querysets by request.user
- Never use raw SQL — use Django ORM only

## Code conventions
- Always add permission_classes = [IsAuthenticated]
- Use select_related for ForeignKey in list views
- All financial calculations must have unit tests
- Docstrings on all ViewSets and Serializers

## Testing
- Framework: pytest-django
- Every endpoint needs: 200 happy path, 
  401 unauthenticated, 403 wrong user
```

---

## Quick cheat sheet
```
@workspace  → full GennyCraft project
@file       → single app (transactions, reports, etc.)
@terminal   → Django errors and migration failures
@github     → issues and PRs

/explain    → understand existing code
/fix        → fix a bug
/tests      → generate pytest tests
/doc        → add docstrings

Cmd+I       → inline edit with diff preview
Tab         → accept inline suggestion
Esc         → reject inline suggestion

Skills location: skills/
Instructions:    .github/copilot-instructions.md