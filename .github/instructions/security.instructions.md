---
applyTo: '**'
description: 'Security rules — always apply'
---

# Security Rules

## Data isolation (CRITICAL)
- Filter ALL querysets by request.user
- Never accept user_id from request body
- Always verify object ownership before update/delete:

    def get_object(self):
        obj = super().get_object()
        if obj.user != self.request.user:
            raise PermissionDenied
        return obj

## Input sanitization
- Never use raw SQL
- Never use **kwargs directly from request.data
- Always validate with serializer before saving

## Sensitive fields — never expose
password, token, secret, internal_id, 
is_staff, is_superuser, last_login