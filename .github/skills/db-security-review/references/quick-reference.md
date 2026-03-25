# DB Security Quick Reference Card

## 🔍 Fast Scan Checklist

Copy this checklist when reviewing files:

### ViewSets (`views.py`)

```python
class MyViewSet(viewsets.ModelViewSet):
    # 1. ✓ Authentication required?
    permission_classes = [IsAuthenticated]  # ← Check this
    
    # 2. ✓ Filtered by user?
    def get_queryset(self):
        return Model.objects.filter(owner=self.request.user)  # ← Check this
    
    # 3. ✓ Ownership verified?
    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:  # ← Check this
            raise PermissionDenied
        return obj
    
    # 4. ✓ Custom actions secured?
    @action(detail=True, methods=['post'])
    def custom_action(self, request, pk=None):
        obj = self.get_object()  # ← Uses get_object() above
        # ... permission already checked
```

**Quick Check**: Every ViewSet should have ALL 4 checks above.

### Serializers (`serializers.py`)

```python
class MySerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        # 1. ✓ Explicit fields (NOT '__all__')
        fields = ('id', 'name', 'amount')  # ← Check: explicit list?
        
        # 2. ✓ Read-only protected
        read_only_fields = ('id', 'created_at', 'owner')  # ← Check: sensitive fields?
    
    # 3. ✓ Owner set on create
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user  # ← Check this
        return super().create(validated_data)
```

**Quick Check**: No `'__all__'`, owner is set, sensitive fields read-only.

### Filters (`filters.py`)

```python
class MyFilter(filters.FilterSet):
    def custom_filter(self, queryset, name, value):
        # ✓ Uses queryset parameter (already filtered)
        return queryset.filter(field=value)  # ← Check: uses `queryset`, not Model.objects?
```

**Quick Check**: Filter methods work on `queryset` param, not direct `Model.objects`.

### Models (`models.py`)

```python
class MyModel(models.Model):
    # ✓ Owner relationship
    owner = models.ForeignKey(User, ...)  # ← Check: has owner field?
    
    # ✓ No raw SQL in managers
    def custom_query(self):
        # ❌ BAD: return self.raw("SELECT...")
        # ✅ GOOD: return self.filter(...)
```

**Quick Check**: Has owner field, no `.raw()` in custom managers.

---

## 🚨 Critical Pattern Searches

Use these grep patterns to find issues fast:

### 1. Raw SQL Detection

```bash
# Search for raw SQL patterns
grep -rn "\.raw(" .
grep -rn "cursor\.execute" .
grep -rn "RawSQL" .
```

**Action**: Every match is CRITICAL - investigate immediately.

### 2. Missing User Filtering

```bash
# Find ViewSets without get_queryset
grep -A5 "class.*ViewSet" views.py | grep -v "get_queryset"

# Find querysets without user filter
grep -rn "\.objects\.all()" .
grep -rn "\.objects\.filter" . | grep -v "user"
```

**Action**: Each ViewSet MUST have `get_queryset()` with user filter.

### 3. Fields='__all__' Detection

```bash
# Find serializers with __all__
grep -rn "fields = '__all__'" .
grep -rn 'fields = "__all__"' .
```

**Action**: Every match needs explicit field list.

### 4. Missing Permission Classes

```bash
# Find ViewSets without permission_classes
grep -B2 -A10 "class.*ViewSet" views.py | grep -v "permission_classes"
```

**Action**: Every ViewSet MUST have `permission_classes`.

---

## 📋 File-by-File Review Template

Use this template for each file:

### `views.py` Review

```
File: path/to/views.py
======================

[ ] All ViewSets have permission_classes = [IsAuthenticated]
[ ] All get_queryset() methods filter by request.user
[ ] All get_object() methods verify ownership
[ ] All @action decorators maintain security
[ ] No direct Model.objects.get() bypassing queryset
[ ] No raw SQL (`.raw()`, `cursor.execute()`)

Issues Found:
-

Recommendations:
-
```

### `serializers.py` Review

```
File: path/to/serializers.py
============================

[ ] All Meta.fields are explicit (no '__all__')
[ ] Sensitive fields in read_only_fields or excluded
[ ] No password, token, is_staff, is_superuser exposed
[ ] create() methods set owner from request.user
[ ] validate() methods check ownership where needed

Issues Found:
-

Recommendations:
-
```

### `filters.py` Review

```
File: path/to/filters.py
========================

[ ] Custom filter methods use queryset parameter
[ ] No direct Model.objects queries
[ ] No raw SQL in filter methods
[ ] Filters respect user scoping from ViewSet

Issues Found:
-

Recommendations:
-
```

### `models.py` Review

```
File: path/to/models.py
=======================

[ ] User-owned models have owner ForeignKey
[ ] No raw SQL in custom managers
[ ] Indexes on frequently filtered fields
[ ] on_delete specified for all ForeignKeys

Issues Found:
-

Recommendations:
-
```

---

## 🎯 Priority Decision Matrix

| Pattern Found | Severity | Response Time |
|---------------|----------|---------------|
| Raw SQL usage | **CRITICAL** | Immediate |
| Missing user filter in ViewSet | **CRITICAL** | Immediate |
| Missing permission_classes | **CRITICAL** | Immediate |
| Mass assignment vulnerability | **CRITICAL** | Immediate |
| `fields = '__all__'` with sensitive data | **HIGH** | 1-3 days |
| Missing get_object() ownership check | **HIGH** | 1-3 days |
| Filter bypassing user scope | **HIGH** | 1-3 days |
| Exposing internal fields | **MEDIUM** | 1-2 weeks |
| N+1 query problem | **MEDIUM** | 1-2 weeks |
| Missing select_related() | **LOW** | Next sprint |

---

## 💡 Common False Positives

These patterns may look suspicious but are often safe:

### ✅ Global Categories (Read-Only)

```python
# SAFE: Global categories shared by all users
def get_queryset(self):
    return Category.objects.filter(
        Q(owner=self.request.user) | Q(owner__isnull=True)
    )
```

**Why Safe**: Explicitly includes both user's categories AND global ones.

### ✅ Superuser Admin Access

```python
# SAFE: Admin sees all with explicit permission
def get_queryset(self):
    if self.request.user.is_superuser:
        return Model.objects.all()
    return Model.objects.filter(owner=self.request.user)
```

**Why Safe**: Superuser permission explicitly checked.

### ✅ Aggregate Queries (No PII)

```python
# SAFE: Aggregates don't expose individual records
def get_stats(request):
    total = Transaction.objects.filter(
        owner=request.user
    ).aggregate(Sum('amount'))
```

**Why Safe**: Still filtered by user, returning aggregates only.

---

## 🔧 Quick Fixes Reference

### Fix: Missing User Filter

```python
# Before
def get_queryset(self):
    return Transaction.objects.all()

# After
def get_queryset(self):
    return Transaction.objects.filter(owner=self.request.user)
```

### Fix: Missing Permission Class

```python
# Before
class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()

# After
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(owner=self.request.user)
```

### Fix: Fields = '__all__'

```python
# Before
class Meta:
    model = User
    fields = '__all__'

# After
class Meta:
    model = User
    fields = ('id', 'email', 'first_name', 'last_name')
    read_only_fields = ('id',)
```

### Fix: Missing Ownership Check

```python
# Before
def get_object(self):
    return super().get_object()

# After
def get_object(self):
    obj = super().get_object()
    if obj.owner != self.request.user:
        raise PermissionDenied
    return obj
```

### Fix: Raw SQL

```python
# Before
User.objects.raw(f"SELECT * FROM users WHERE email = '{email}'")

# After
User.objects.filter(email=email)
```

---

## 📝 Report Template

Use this template for your final report:

```markdown
# DB Security Review Report

**Project**: GennyCraft
**Date**: YYYY-MM-DD
**Reviewer**: [Name]
**Scope**: [Files/Apps reviewed]

---

## 🔴 CRITICAL Issues

### [Issue Title]
- **File**: `path/to/file.py:line`
- **Issue**: [Description]
- **Impact**: [What attacker can do]
- **Fix**:
  ```python
  [Code fix]
  ```

---

## 🟠 HIGH Priority

[Same format as CRITICAL]

---

## 🟡 MEDIUM Priority

[Same format]

---

## 🟢 LOW Priority / Recommendations

[Same format]

---

## ✅ Security Strengths

[List what's implemented well]

---

## 📊 Summary

- **Files Reviewed**: X
- **Critical Issues**: X
- **High Priority**: X
- **Medium Priority**: X
- **Low Priority**: X
- **Overall Risk**: CRITICAL/HIGH/MEDIUM/LOW

**Recommendation**: [Overall assessment and next steps]
```

---

## 🧪 Testing Security Fixes

After applying fixes, test with:

```python
# Test 1: Unauthenticated access should fail
response = client.get('/api/transactions/')
assert response.status_code == 401

# Test 2: Authenticated user sees only their data
response = client.get('/api/transactions/')
assert all(t['owner'] == request.user.id for t in response.data)

# Test 3: Cannot access other user's data
other_user_transaction = OtherTransaction.objects.first()
response = client.get(f'/api/transactions/{other_user_transaction.id}/')
assert response.status_code == 404  # Or 403

# Test 4: Cannot elevate privileges
response = client.patch('/api/profile/', {'is_staff': true})
assert not User.objects.get(id=user.id).is_staff
```
