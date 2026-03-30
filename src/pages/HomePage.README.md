# HomePage

Main wallet dashboard page that displays the user's total balance, quick action buttons, and recent transactions overview.

## Figma Design
[MyWallet - Home Page](https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=2-2)

## Features

- **Balance Display**: Shows total balance across all active accounts using BalanceCard component
- **Quick Actions**: Four action buttons (Add Funds, Send, Request, History) via QuickActionsBar
- **Recent Transactions**: Placeholder section for transaction list (to be implemented)
- **Security Footer**: Privacy and security reassurance message
- **Loading State**: Shows loading indicator while fetching account data
- **Error Handling**: Displays error message with retry button on failure

## Components Used

- `Layout`: Standard page wrapper with navigation
- `BalanceCard`: Displays total balance with visibility toggle
- `QuickActionsBar`: Four quick action buttons for common operations

## Data Flow

1. On mount, calls `accountsApi.getSummary()` to fetch all active accounts
2. Calculates and displays total balance
3. Handles quick action clicks by navigating to appropriate pages
4. Persists balance visibility preference to localStorage

## Navigation Routes

- **Add Funds**: `/accounts` - Navigate to accounts management
- **Send**: `/transactions?type=expense` - Create expense transaction
- **Request**: `/transactions?type=income` - Create income transaction
- **History**: `/transactions` - View all transactions

## State Management

| State | Type | Purpose |
|-------|------|---------|
| `totalBalance` | number | Sum of all active account balances |
| `percentChange` | number | Balance change percentage (TODO: calculate from history) |
| `isLoading` | boolean | Loading state while fetching data |
| `error` | string | Error message if data fetch fails |

## API Integration

Uses `accountsApi.getSummary()` which returns:
```typescript
{
  total_balance: number,
  account_count: number,
  accounts: Account[]
}
```

## Future Enhancements

- [ ] Add recent transactions list (integrate with transactionsApi)
- [ ] Calculate actual percentChange from historical balance data
- [ ] Add notification bell and profile icons to header
- [ ] Implement Add Funds modal/flow
- [ ] Add account switcher/selector
- [ ] Add charts/visualizations for spending breakdown

## Usage

```typescript
import { HomePage } from './pages';

// In App.tsx router:
<Route path="/home" element={<HomePage />} />
```

## Related Files

- `src/api/accounts.ts` - Accounts API module
- `src/components/BalanceCard/` - Balance display component
- `src/components/QuickActionsBar/` - Quick actions component
- `src/pages/TransactionsPage.tsx` - Transactions list page
- `src/pages/DashboardPage.tsx` - Alternative dashboard view
