# Common Database Security Vulnerabilities in Django

## 1. SQL Injection

### Vulnerable Patterns

```python
# ❌ CRITICAL: String concatenation in raw SQL
User.objects.raw(f"SELECT * FROM users WHERE email = '{email}'")

# ❌ CRITICAL: Cursor with string formatting
cursor.execute("SELECT * FROM transactions WHERE user_id = %s" % user_id)

# ❌ CRITICAL: Extra() with unsanitized input
Transaction.objects.extra(where=[f"amount > {min_amount}"])

# ❌ CRITICAL: RawSQL with string concatenation
from django.db.models.expressions import RawSQL
queryset.annotate(val=RawSQL(f"select col from table where id={id}", []))
```

### Safe Alternatives

```python
# ✅ SAFE: Parameterized raw query
User.objects.raw("SELECT * FROM users WHERE email = %s", [email])

# ✅ SAFE: Use Django ORM
Transaction.objects.filter(amount__gt=min_amount)

# ✅ SAFE: Proper parameterization
from django.db.models.expressions import RawSQL
queryset.annotate(val=RawSQL("select col from table where id=%s", [id]))
```

## 2. Insecure Direct Object Reference (IDOR)

### Vulnerable Pattern

```python
# ❌ CRITICAL: No ownership verification
class TransactionViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Transaction.objects.all()  # Returns ALL users' data!

# ❌ CRITICAL: Bypassing queryset filter
def destroy(self, request, pk):
    transaction = Transaction.objects.get(pk=pk)  # No user check!
    transaction.delete()
```

**Exploit**: User A can access/modify User B's transactions by changing the ID in the URL.

### Secure Pattern

```python
# ✅ SECURE: Filter by authenticated user
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(owner=self.request.user)
    
    def get_object(self):
        obj = super().get_object()
        if obj.owner != self.request.user:
            raise PermissionDenied("Not your transaction")
        return obj
```

## 3. Mass Assignment Vulnerabilities

### Vulnerable Pattern

```python
# ❌ CRITICAL: Exposing all fields
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Exposes is_staff, is_superuser!

# ❌ CRITICAL: Direct kwargs from request
def update(self, request, pk):
    user = User.objects.get(pk=pk)
    for key, value in request.data.items():
        setattr(user, key, value)  # Can set is_staff=True!
    user.save()
```

**Exploit**: Attacker sends `{"is_staff": true, "is_superuser": true}` to gain admin access.

### Secure Pattern

```python
# ✅ SECURE: Explicit field list
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')
        read_only_fields = ('id', 'is_staff', 'is_superuser')

# ✅ SECURE: Use serializer validation
def update(self, request, pk):
    user = User.objects.get(pk=pk)
    serializer = UserUpdateSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
```

## 4. Missing Authentication/Authorization

### Vulnerable Pattern

```python
# ❌ CRITICAL: No authentication required
class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    # permission_classes not set - defaults to AllowAny!

# ❌ HIGH: Authentication but no ownership check
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account(request, account_id):
    account = Account.objects.get(id=account_id)  # Any authenticated user can access!
    return Response(AccountSerializer(account).data)
```

### Secure Pattern

```python
# ✅ SECURE: Explicit authentication + filtering
class AccountViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountSerializer
    
    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

# ✅ SECURE: Authentication + ownership verification
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account(request, account_id):
    account = get_object_or_404(
        Account,
        id=account_id,
        user=request.user  # Ensures ownership
    )
    return Response(AccountSerializer(account).data)
```

## 5. Information Disclosure via Serializers

### Vulnerable Pattern

```python
# ❌ HIGH: Exposing sensitive fields
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  # Exposes: password, last_login, is_staff...

# ❌ HIGH: Including internal fields
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'internal_ref', 'audit_trail']  # internal_ref shouldn't be exposed
```

### Secure Pattern

```python
# ✅ SECURE: Explicit safe fields only
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name')
        # password, is_staff, is_superuser NOT included

# ✅ SECURE: Public fields only
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('id', 'amount', 'date', 'category', 'title')
        read_only_fields = ('id',)
```

## 6. Filter Bypass Vulnerabilities

### Vulnerable Pattern

```python
# ❌ CRITICAL: Filter doesn't check ownership
class TransactionFilter(filters.FilterSet):
    def search_filter(self, queryset, name, value):
        # Searches ALL transactions, not just user's!
        return Transaction.objects.filter(title__icontains=value)

    class Meta:
        model = Transaction
        fields = ['type', 'category']
```

**Exploit**: User can search and find other users' transaction data.

### Secure Pattern

```python
# ✅ SECURE: Filter respects user ownership
class TransactionFilter(filters.FilterSet):
    def search_filter(self, queryset, name, value):
        # Filters already scoped to user from get_queryset()
        return queryset.filter(title__icontains=value)

    class Meta:
        model = Transaction
        fields = ['type', 'category']
```

## 7. Permission Check Inconsistencies

### Vulnerable Pattern

```python
# ❌ HIGH: Custom action without permission check
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(owner=self.request.user)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        # No permission check - could accept ANY transaction IDs!
        ids = request.data.get('ids', [])
        Transaction.objects.filter(id__in=ids).delete()  # ❌ Deletes ANY transaction!
```

### Secure Pattern

```python
# ✅ SECURE: Consistent permission checks
class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(owner=self.request.user)
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        ids = request.data.get('ids', [])
        # Only delete user's own transactions
        deleted = Transaction.objects.filter(
            id__in=ids,
            owner=request.user  # ✅ Ownership check
        ).delete()
        return Response({'deleted': deleted[0]})
```

## 8. Unvalidated Redirects via Query Parameters

### Vulnerable Pattern

```python
# ❌ MEDIUM: Using user input in queries without validation
def get_transactions(request):
    sort_by = request.GET.get('sort', 'date')
    # If sort_by='__class__.__init__.__globals__' - potential code execution!
    transactions = Transaction.objects.filter(
        user=request.user
    ).order_by(sort_by)  # ❌ Unvalidated user input
```

### Secure Pattern

```python
# ✅ SECURE: Whitelist allowed sort fields
def get_transactions(request):
    ALLOWED_SORT_FIELDS = ['date', 'amount', 'category', '-date', '-amount']
    sort_by = request.GET.get('sort', 'date')
    
    if sort_by not in ALLOWED_SORT_FIELDS:
        sort_by = 'date'  # Default to safe value
    
    transactions = Transaction.objects.filter(
        user=request.user
    ).order_by(sort_by)
```

## 9. Timing Attacks on Data Checks

### Vulnerable Pattern

```python
# ❌ LOW: Reveals if object exists via error timing
def get_transaction(request, pk):
    try:
        transaction = Transaction.objects.get(pk=pk)
        if transaction.owner != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        return Response(TransactionSerializer(transaction).data)
    except Transaction.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
```

**Issue**: Attacker can tell if a transaction ID exists by timing differences (404 vs 403).

### Secure Pattern

```python
# ✅ SECURE: Uniform response for non-existent or unauthorized
def get_transaction(request, pk):
    transaction = get_object_or_404(
        Transaction,
        pk=pk,
        owner=request.user  # Single query with both checks
    )
    return Response(TransactionSerializer(transaction).data)
    # Returns 404 for both non-existent and unauthorized
```

## 10. Django ORM Pitfalls

### N+1 Query Problem (Performance → DoS)

```python
# ❌ MEDIUM: N+1 queries enable DoS
def list_transactions(request):
    transactions = Transaction.objects.filter(owner=request.user)
    return Response([
        {
            'id': t.id,
            'category': t.category.name,  # ❌ Query per transaction!
            'account': t.account.name,    # ❌ Another query per transaction!
        }
        for t in transactions
    ])
```

**With 1000 transactions**: 1 + 1000 + 1000 = 2001 queries!

```python
# ✅ SECURE: Optimized queries
def list_transactions(request):
    transactions = Transaction.objects.filter(
        owner=request.user
    ).select_related('category', 'account')  # ✅ 1 query total
    
    return Response([
        {
            'id': t.id,
            'category': t.category.name,
            'account': t.account.name,
        }
        for t in transactions
    ])
```

## Detection Checklist

Use this checklist when reviewing code:

- [ ] ❌ Raw SQL (`raw()`, `cursor.execute()`)
- [ ] ❌ `fields = '__all__'` in serializers
- [ ] ❌ Missing `permission_classes = [IsAuthenticated]`
- [ ] ❌ Queryset without `.filter(user=request.user)`
- [ ] ❌ Direct `Model.objects.get()` without ownership check
- [ ] ❌ Exposing sensitive fields (password, is_staff, tokens)
- [ ] ❌ `setattr()` or `update(**request.data)` without validation
- [ ] ❌ Custom actions without permission checks
- [ ] ❌ Filter methods that don't respect user scope
- [ ] ❌ Unvalidated user input in `order_by()` or `extra()`

## Severity Guidelines

**CRITICAL** (Immediate fix required):
- SQL injection
- Missing user filtering (IDOR)
- Mass assignment of privileged fields
- Authentication completely missing

**HIGH** (Fix within days):
- Exposing sensitive fields
- Permission checks inconsistent across actions
- Filter bypass vulnerabilities

**MEDIUM** (Fix within weeks):
- N+1 queries enabling DoS
- Unvalidated sort/filter parameters
- Information leakage via error messages

**LOW** (Best practice):
- Timing attack susceptibility
- Missing indexes on filtered fields
- Verbose error messages in production
