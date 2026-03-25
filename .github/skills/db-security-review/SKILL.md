---
name: db-security-review
description: 'Review database operations for vulnerabilities in Django/DRF projects. Use when: auditing DB queries, checking data isolation, SQL injection prevention, reviewing querysets, validating ORM usage, checking permissions on data access, mass assignment vulnerabilities, reviewing filters and serializers for security issues.'
user-invocable: true
---

# Database Security Review

## When to Use

- Auditing database queries for security vulnerabilities
- Reviewing Django ORM usage and queryset filtering
- Checking data isolation between users (multi-tenant security)
- Preventing SQL injection and ORM abuse
- Validating permission checks on data access
- Reviewing serializers for mass assignment vulnerabilities
- Analyzing filters, views, and models for security flaws

## What This Skill Produces

A comprehensive security audit report identifying:
- **CRITICAL**: Immediate security vulnerabilities (data leaks, SQL injection)
- **HIGH**: Security weaknesses requiring prompt attention
- **MEDIUM**: Best practice violations that could become vulnerabilities
- **LOW**: Recommendations for improved security posture

## Procedure

### 1. Scope Identification

Identify which files to review:
- `**/models.py` - Data models and database schema
- `**/views.py` - ViewSets and API endpoints
- `**/serializers.py` - Data serialization and validation
- `**/filters.py` - Query filtering logic
- `**/permissions.py` - Custom permission classes
- `**/queries.py` or custom query files

### 2. Critical Security Checks

Run these checks in order:

#### A. SQL Injection Prevention
**Pattern**: Search for raw SQL usage
```python
# FORBIDDEN patterns:
.raw(...)
cursor.execute(...)
connection.cursor()
Extra(where=[...])  # with string concatenation
```

**Rule**: Django ORM only. Raw SQL is **ALWAYS CRITICAL**.

#### B. Data Isolation (Multi-Tenant)
**Pattern**: Every queryset accessing user data MUST filter by ownership

```python
# REQUIRED:
def get_queryset(self):
    return Model.objects.filter(user=self.request.user)

# CRITICAL if missing
def get_queryset(self):
    return Model.objects.all()  # ❌ CRITICAL: No user filter
```

**Files to check**:
- All ViewSet `get_queryset()` methods
- All custom manager methods
- All query methods in models
- Filter classes in `filters.py`

#### C. Permission Validation
**Pattern**: Check authentication and object-level permissions

```python
# REQUIRED in every ViewSet:
permission_classes = [IsAuthenticated]

# REQUIRED for update/delete:
def get_object(self):
    obj = super().get_object()
    if obj.owner != self.request.user:
        raise PermissionDenied
    return obj
```

#### D. Input Validation & Mass Assignment
**Pattern**: Check serializers for unsafe field exposure

```python
# FORBIDDEN - exposing sensitive fields:
class Meta:
    fields = '__all__'  # ❌ May expose password, is_staff, etc.

# FORBIDDEN - accepting untrusted field updates:
model.update(**request.data)  # ❌ CRITICAL: Mass assignment

# REQUIRED - explicit field definitions:
class Meta:
    fields = ('id', 'name', 'amount')  # ✅ Explicit
    read_only_fields = ('id', 'created_at')  # ✅ Protected
```

#### E. ORM N+1 Queries & Performance
**Pattern**: Check for missing `select_related()` and `prefetch_related()`

```python
# BAD - N+1 query problem
for transaction in Transaction.objects.all():
    print(transaction.category.name)  # ❌ Query per item

# GOOD - Optimized
transactions = Transaction.objects.select_related('category')
```

**Note**: This is MEDIUM priority (performance, not security) unless it enables DoS.

### 3. Review Checklist

For each file reviewed, verify:

**Models (`models.py`)**
- [ ] No raw SQL in custom managers
- [ ] Sensitive fields use appropriate field types (e.g., `PasswordField`)
- [ ] Proper use of indexes for filtered fields
- [ ] Foreign keys have `on_delete` specified correctly

**ViewSets (`views.py`)**
- [ ] `permission_classes = [IsAuthenticated]` on ALL viewsets
- [ ] `get_queryset()` filters by `request.user` or related owner field
- [ ] `get_object()` verifies ownership before returning
- [ ] No direct model access bypassing querysets (e.g., `Model.objects.get(pk=id)`)
- [ ] Custom actions (`@action`) also implement permission checks

**Serializers (`serializers.py`)**
- [ ] `fields` is explicit list, NOT `'__all__'`
- [ ] Sensitive fields in `read_only_fields` or excluded
- [ ] No password, token, secret, is_staff, is_superuser exposed
- [ ] `validate()` methods check ownership where applicable
- [ ] `create()` / `update()` set owner to `request.user` from context

**Filters (`filters.py`)**
- [ ] No raw SQL in custom filter methods
- [ ] Filters don't bypass user ownership checks
- [ ] Search filters use ORM `.filter()`, not raw WHERE clauses

**Permissions (`permissions.py`)**
- [ ] Custom permissions verify object ownership
- [ ] `has_object_permission()` checks `obj.owner == request.user`
- [ ] Permissions are actually used in viewsets

### 4. Generate Report

Structure the report as follows:

```markdown
## 🔴 CRITICAL Issues
[List any immediate security vulnerabilities]
- **File**: path/to/file.py:line
- **Issue**: Clear description
- **Impact**: What attacker could do
- **Fix**: Specific code change needed

## 🟠 HIGH Priority
[Security weaknesses requiring prompt attention]

## 🟡 MEDIUM Priority
[Best practice violations]

## 🟢 LOW Priority / Recommendations
[Suggestions for improvement]

## ✅ Security Strengths
[What is done well - be specific]

## Summary
- Total files reviewed: X
- Critical issues: X
- High priority: X
- Overall risk: [CRITICAL/HIGH/MEDIUM/LOW]
```

### 5. Common Vulnerabilities Reference

Consult [./references/common-vulnerabilities.md](./references/common-vulnerabilities.md) for examples of:
- SQL injection patterns in Django
- Insecure direct object reference (IDOR)
- Mass assignment exploitation
- Permission bypass techniques
- ORM abuse patterns

## Quality Standards

- **Be Specific**: Always include file name and line number
- **Explain Impact**: Show what an attacker could do
- **Provide Fixes**: Give exact code to resolve the issue
- **Prioritize Correctly**: 
  - CRITICAL = Active data breach risk
  - HIGH = Easy to exploit weakness
  - MEDIUM = Requires specific conditions
  - LOW = Theoretical or minor issue

## Example Usage

**User**: "Review the transactions app for DB vulnerabilities"

**Skill Response**:
1. Identifies all DB-touching files in `transactions/`
2. Runs security checks A-E on each file
3. Generates prioritized report with specific findings
4. Provides actionable fixes for each issue

**User**: "Check if querysets are filtering by user"

**Skill Response**:
1. Searches all `get_queryset()` methods
2. Identifies missing `.filter(user=...)` calls
3. Reports each missing filter as CRITICAL
4. Shows correct implementation

## Constraints

- **Read-only**: This skill performs analysis only, does NOT modify code
- **Django-specific**: Optimized for Django/DRF patterns
- **No false positives**: Only flag actual vulnerabilities, not theoretical concerns
- **Context-aware**: Consider app architecture and existing security controls

## Tools Used

- `grep_search` - Find patterns across codebase
- `read_file` - Examine specific files in detail
- `semantic_search` - Find related security patterns
- `get_errors` - Check for existing lint/type errors

## Related Customizations

- **Agent**: `GennyCraft Code Reviewer` - For general code review including security
- **Instructions**: `.github/instructions/security.instructions.md` - Security rules
- **Instructions**: `.github/instructions/api-patterns.instructions.md` - DRF patterns
