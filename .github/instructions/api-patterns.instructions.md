---
applyTo: '**/views.py,**/serializers.py'
description: 'DRF patterns for GennyCraft API layer'
---

# API Patterns

## Views
- Always use ViewSets, never APIView or View
- Always set permission_classes = [IsAuthenticated]
- Always override get_queryset() to filter by user:

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

## Serializers
- Never include: password, is_staff, is_superuser
- Always use read_only=True for: id, created_at, updated_at
- Nested serializers: read-only only, never writable nested

## Response format
Success:  {"data": {...}, "message": "..."}
Error:    {"error": {"code": "...", "message": "..."}}