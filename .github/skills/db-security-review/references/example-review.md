# Example Security Review Walkthrough

This document shows a complete example of running a DB security review using this skill.

## Scenario

User wants to review the `transactions` app for database security vulnerabilities.

## Step 1: Invoke the Skill

```
User: /db-security-review Review the transactions app for DB vulnerabilities
```

## Step 2: Skill Identifies Files

The skill automatically finds:
- `transactions/models.py`
- `transactions/views.py`
- `transactions/serializers.py`
- `transactions/filters.py`
- `transactions/permissions.py`

## Step 3: Run Security Checks

### Check A: SQL Injection

**Search Pattern**: `\.raw(`, `cursor.execute`, `RawSQL`

**Result**: ✅ No matches found in transactions app

---

### Check B: Data Isolation

**File**: `transactions/views.py`

**Code Found**:
```python
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]
    
    def get_queryset(self) -> QuerySet[Transaction]:
        """Return only user's own non-deleted transactions."""
        return Transaction.objects.filter(
            owner=self.request.user,  # ✅ Filtered by user
            is_deleted=False
        ).select_related('category', 'owner')
```

**Finding**: ✅ **SECURE** - Properly filtered by `owner=self.request.user`

---

### Check C: Permission Validation

**Code Found**:
```python
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwner]  # ✅ Present
```

**Finding**: ✅ **SECURE** - Has `IsAuthenticated` and custom `IsOwner` permission

---

### Check D: Mass Assignment

**File**: `transactions/serializers.py`

**Code Found**:
```python
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = (
            'id', 'type', 'amount', 'currency', 'date',
            'category', 'category_details', 'title', 'note',
            'attachment', 'is_recurring', 'recurring_rule',
            'is_deleted', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'is_deleted', 'created_at', 'updated_at')
```

**Findings**:
- ✅ Fields are explicit (not `'__all__'`)
- ✅ `id`, `created_at`, `updated_at` are read-only
- ⚠️ **MEDIUM**: `is_deleted` is in `fields` but also in `read_only_fields` (redundant but safe)

**Create Method**:
```python
def create(self, validated_data):
    """Set owner when creating."""
    validated_data['owner'] = self.context['request'].user  # ✅ Owner set correctly
    return super().create(validated_data)
```

**Finding**: ✅ **SECURE** - Owner set from request.user

---

### Check E: Filter Security

**File**: `transactions/filters.py`

**Code Found**:
```python
class TransactionFilter(filters.FilterSet):
    def search_filter(self, queryset, name, value):
        """Search in title and note fields."""
        return queryset.filter(  # ✅ Uses queryset parameter
            models.Q(title__icontains=value) |
            models.Q(note__icontains=value)
        )
```

**Finding**: ✅ **SECURE** - Uses `queryset` parameter, not direct `Transaction.objects`

---

### Additional Check: Custom Actions

**Code Found**:
```python
@action(detail=False, methods=['get'])
def export(self, request):
    """Export transactions to CSV."""
    transactions = self.filter_queryset(self.get_queryset())  # ✅ Uses filtered queryset
```

**Finding**: ✅ **SECURE** - Custom actions use `self.get_queryset()` which includes user filter

---

### Additional Check: File Upload

**Code Found**:
```python
@action(detail=True, methods=['post'])
def attach_file(self, request, pk=None):
    """Attach a file to a transaction."""
    transaction = self.get_object()  # ✅ Uses get_object() = ownership check
    
    # Validate file size
    max_size = getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 5242880)
    if file.size > max_size:  # ✅ Size validation
        return Response(...)
    
    # Validate file type
    allowed_types = getattr(settings, 'ALLOWED_ATTACHMENT_TYPES', [])
    if allowed_types and file.content_type not in allowed_types:  # ✅ Type validation
        return Response(...)
```

**Finding**: ✅ **SECURE** - File upload has proper validation and ownership check

---

## Step 4: Generate Report

```markdown
# DB Security Review Report

**Project**: GennyCraft
**App**: transactions
**Date**: 2026-03-23
**Files Reviewed**: 5

---

## 🔴 CRITICAL Issues

None found.

---

## 🟠 HIGH Priority

None found.

---

## 🟡 MEDIUM Priority

### 1. Redundant read_only Field Declaration

- **File**: `transactions/serializers.py:18`
- **Issue**: `is_deleted` appears in both `fields` and `read_only_fields`. While safe, this is redundant.
- **Impact**: None (no security risk, just code cleanliness)
- **Fix**:
  ```python
  # Option 1: Remove from read_only_fields (it's already controlled by model)
  read_only_fields = ('id', 'created_at', 'updated_at')
  
  # Option 2: Remove from fields entirely if users shouldn't see it
  fields = (
      'id', 'type', 'amount', 'currency', 'date',
      'category', 'category_details', 'title', 'note',
      'attachment', 'is_recurring', 'recurring_rule',
      'created_at', 'updated_at'
  )
  ```

---

## 🟢 LOW Priority / Recommendations

### 1. Consider Adding Pagination for Export

- **File**: `transactions/views.py:62`
- **Recommendation**: The CSV export action loads all transactions into memory. For users with many transactions, consider:
  - Implementing streaming CSV output
  - Adding pagination or date range limits
  - Using Celery for async export with download link

---

## ✅ Security Strengths

The `transactions` app demonstrates excellent security practices:

1. **Data Isolation**: All querysets properly filter by `owner=request.user`
2. **Authentication**: `permission_classes = [IsAuthenticated, IsOwner]` enforced
3. **No Raw SQL**: All queries use Django ORM
4. **Explicit Fields**: Serializers use explicit field lists, not `'__all__'`
5. **Owner Assignment**: Create method explicitly sets `owner` from request
6. **Custom Actions**: All custom actions maintain security through `get_object()`
7. **File Validation**: File uploads have size and type validation
8. **Query Optimization**: Uses `select_related()` to prevent N+1 queries
9. **Soft Delete**: Implements soft delete pattern with `is_deleted` flag
10. **Filter Security**: Custom filter methods work on pre-filtered queryset

---

## 📊 Summary

- **Files Reviewed**: 5
- **Critical Issues**: 0
- **High Priority**: 0
- **Medium Priority**: 1 (code cleanliness)
- **Low Priority**: 1 (performance recommendation)
- **Overall Risk**: **LOW** ✅

**Recommendation**: The `transactions` app is **secure and production-ready** from a database security perspective. The identified issues are minor improvements and do not present security risks. This app serves as an excellent example of secure Django/DRF patterns.

## Follow-up Actions

1. ✅ **Immediately**: None required (no critical issues)
2. 📋 **Soon**: Address medium priority redundant field (1-2 weeks)
3. 💡 **Backlog**: Consider pagination for CSV export

```

---

## Key Takeaways from This Example

### What Made This Review Successful

1. **Systematic Approach**: Followed A-E checklist from skill
2. **Context Aware**: Understood app purpose and architecture
3. **Specific Findings**: Cited exact files and line numbers
4. **Risk Prioritization**: Correctly identified no critical issues
5. **Actionable Recommendations**: Provided specific code fixes
6. **Positive Feedback**: Acknowledged what was done well

### What to Look For in Your Reviews

Use this example as a template. A good review should:

- ✅ Check all 5 critical areas (A-E)
- ✅ Cite specific files and line numbers
- ✅ Explain WHY something is secure or insecure
- ✅ Provide concrete fixes, not vague suggestions
- ✅ Acknowledge security strengths (not just weaknesses)
- ✅ Prioritize findings correctly
- ✅ Consider context (e.g., soft delete is intentional, not a bug)

### Common Mistakes to Avoid

- ❌ False positive: Flagging `owner__isnull=True` as insecure (it's for global categories)
- ❌ Missing context: Calling soft delete a "security issue"
- ❌ Wrong priority: Classifying code style issues as CRITICAL
- ❌ Vague feedback: "Needs better security" without specifics
- ❌ No acknowledgment: Only listing problems, not strengths

---

## Practice Exercise

Try reviewing the `categories` app yourself:

1. List the files to review
2. Run checks A-E
3. Document findings with file:line citations
4. Generate a report using the template

**Hint**: Pay attention to how categories handle global vs user-owned records.

Compare your findings to this transactions review for consistency.
