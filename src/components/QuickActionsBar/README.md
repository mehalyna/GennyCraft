# QuickActionsBar Component

**Figma Design:** [View in Figma](https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=2-41)

A horizontal row of action buttons for common wallet operations. Each button displays an icon and label with consistent styling and hover effects.

## Features

✅ **Default Actions** - Pre-configured: Add Funds, Send, Request, History  
✅ **Custom Actions** - Pass your own action set  
✅ **Flexible Icons** - Supports SVG components or image URLs  
✅ **Hover Effects** - Subtle animations on interaction  
✅ **Responsive Layout** - Buttons adapt to container width  
✅ **Type Safe** - Full TypeScript support  
✅ **Accessibility** - ARIA labels and keyboard navigation  

## Usage

### Basic Usage (Default Actions)

```tsx
import { QuickActionsBar } from '@/components';

function Dashboard() {
  const handleAction = (actionId: string) => {
    console.log('Action:', actionId);
    // Handle navigation or modal opening
  };

  return (
    <QuickActionsBar onActionClick={handleAction} />
  );
}
```

### Custom Actions

```tsx
import { QuickActionsBar } from '@/components';

const SendIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
      stroke="currentColor" strokeWidth="2" />
  </svg>
);

function Wallet() {
  const customActions = [
    { id: 'transfer', label: 'Transfer', icon: SendIcon },
    { id: 'pay-bill', label: 'Pay Bill', icon: SendIcon },
    { id: 'top-up', label: 'Top Up', icon: SendIcon },
  ];

  return (
    <QuickActionsBar 
      actions={customActions}
      onActionClick={(id) => navigate(`/wallet/${id}`)}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `actions` | `QuickAction[]` | ❌ | Default 4 actions | Array of actions to display |
| `onActionClick` | `(actionId: string) => void` | ❌ | - | Callback when action is clicked |
| `className` | `string` | ❌ | - | Additional CSS class |

### QuickAction Interface

```typescript
interface QuickAction {
  id: string;              // Unique identifier
  label: string;           // Display text
  icon: string | ReactNode; // Icon (URL or React component)
  badge?: number;          // Optional badge count
  disabled?: boolean;      // Disable the action
}
```

## Default Actions

When no `actions` prop is provided, these default actions are displayed:

1. **Add Funds** - ID: `add-funds`
2. **Send** - ID: `send`
3. **Request** - ID: `request`
4. **History** - ID: `history`

## Examples

### With React Router Navigation

```tsx
import { useNavigate } from 'react-router-dom';
import { QuickActionsBar } from '@/components';

function Dashboard() {
  const navigate = useNavigate();

  const handleAction = (actionId: string) => {
    const routes = {
      'add-funds': '/wallet/add',
      'send': '/wallet/send',
      'request': '/wallet/request',
      'history': '/transactions',
    };
    navigate(routes[actionId]);
  };

  return <QuickActionsBar onActionClick={handleAction} />;
}
```

### Opening Modals

```tsx
import { QuickActionsBar } from '@/components';
import { useState } from 'react';

function Wallet() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <>
      <QuickActionsBar onActionClick={setActiveModal} />
      
      {activeModal === 'add-funds' && <AddFundsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'send' && <SendMoneyModal onClose={() => setActiveModal(null)} />}
    </>
  );
}
```

### Two Actions Only

```tsx
<QuickActionsBar 
  actions={[
    { id: 'deposit', label: 'Deposit', icon: <DepositIcon /> },
    { id: 'withdraw', label: 'Withdraw', icon: <WithdrawIcon /> },
  ]}
/>
```

### With Image URLs

```tsx
<QuickActionsBar 
  actions={[
    { id: 'scan', label: 'Scan', icon: '/icons/qr-code.svg' },
    { id: 'pay', label: 'Pay', icon: '/icons/credit-card.svg' },
  ]}
/>
```

## Design Tokens Used

- **Colors:** White background, black text, light gray hover
- **Typography:** Inter font, 14px medium weight
- **Spacing:** 12px gap between buttons, 16px padding
- **Border:** 0.8px solid with light border color
- **Border Radius:** 14px rounded corners
- **Min Height:** 85.6px for consistent button size

## Styling

The component uses inline styles with design tokens. To customize:

1. **Override via className:**
```tsx
<QuickActionsBar className="custom-actions" />
```

2. **Wrap in styled container:**
```tsx
<div style={{ maxWidth: '800px', margin: '0 auto' }}>
  <QuickActionsBar />
</div>
```

## Hover States

Each button features:
- Background color change to light gray
- Upward translation (2px)
- Subtle drop shadow
- Smooth 0.2s transition

## Integration with GennyCraft

Suggested routing in your Django + React app:

```tsx
const handleAction = (actionId: string) => {
  switch (actionId) {
    case 'add-funds':
      // Open add funds modal or navigate to /accounts/add-funds
      break;
    case 'send':
      // Open transaction form in 'expense' mode
      navigate('/transactions/create?type=expense');
      break;
    case 'request':
      // Open transaction form in 'income' mode
      navigate('/transactions/create?type=income');
      break;
    case 'history':
      // Navigate to transactions list
      navigate('/transactions');
      break;
  }
};
```

## Accessibility

- ✅ All buttons have `aria-label` attributes
- ✅ Keyboard accessible (tab navigation)
- ✅ Clear focus indicators
- ✅ Semantic button elements
- ✅ Non-decorative icons hidden from screen readers

## File Structure

```
QuickActionsBar/
├── QuickActionsBar.tsx          # Main component
├── QuickActionsBar.types.ts     # TypeScript interfaces
├── QuickActionsBar.example.tsx  # Usage examples
├── index.ts                     # Barrel export
└── README.md                    # This file
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance Notes

- Icons are inline SVGs for optimal performance
- No external icon library dependencies
- Minimal re-renders (only on prop changes)
- Efficient hover state handling
