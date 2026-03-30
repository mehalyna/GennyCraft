# BalanceCard Component

**Figma Design:** [View in Figma](https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=2-23)

A premium balance display card featuring:
- Dark gradient background
- Large balance display with visibility toggle
- Growth indicator with percentage change
- Icon support for trend visualization

## Features

✅ **Balance Visibility Toggle** - Click the eye icon to show/hide balance  
✅ **Currency Formatting** - Automatic USD formatting with locale support  
✅ **Growth Indicator** - Visual feedback for positive/negative changes  
✅ **Responsive Design** - Adapts to container width  
✅ **Type Safe** - Full TypeScript support  
✅ **Design Tokens** - Uses project design system  

## Usage

```tsx
import { BalanceCard } from '@/components';

function Dashboard() {
  return (
    <BalanceCard
      balance={2847.65}
      percentChange={12.5}
      changeDescription="from last month"
      onToggleVisibility={(isVisible) => console.log(isVisible)}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `balance` | `number` | ✅ | - | Total balance amount to display |
| `percentChange` | `number` | ✅ | - | Percentage change (positive or negative) |
| `changeDescription` | `string` | ❌ | `'from last month'` | Description text for change indicator |
| `onToggleVisibility` | `(isVisible: boolean) => void` | ❌ | - | Callback when visibility is toggled |
| `showBalance` | `boolean` | ❌ | `true` | Initial visibility state |
| `className` | `string` | ❌ | - | Additional CSS class |

## Examples

### Basic Usage
```tsx
<BalanceCard balance={2847.65} percentChange={12.5} />
```

### With Callback
```tsx
<BalanceCard
  balance={2847.65}
  percentChange={12.5}
  onToggleVisibility={(visible) => {
    localStorage.setItem('showBalance', String(visible));
  }}
/>
```

### Initially Hidden
```tsx
<BalanceCard
  balance={2847.65}
  percentChange={12.5}
  showBalance={false}
/>
```

### Negative Change
```tsx
<BalanceCard
  balance={1523.40}
  percentChange={-3.2}
  changeDescription="from last week"
/>
```

## Design Tokens Used

- **Colors:** Dark gradient background, white text
- **Typography:** Inter font family, 36px balance size
- **Spacing:** 24px padding, 16px gaps
- **Border Radius:** 16px rounded corners
- **Shadow:** Elevated card shadow

## Asset URLs

⚠️ **Important:** Icon assets from Figma are valid for 7 days. After that, you'll need to:
1. Download and save icons locally in `/public/assets/icons/`
2. Update import paths in `BalanceCard.tsx`

Current icons:
- Eye icon (visibility on)
- Eye closed icon (visibility off)
- Trend up icon (growth indicator)

## File Structure

```
BalanceCard/
├── BalanceCard.tsx           # Main component
├── BalanceCard.types.ts      # TypeScript interfaces
├── BalanceCard.example.tsx   # Usage examples
├── index.ts                  # Barrel export
└── README.md                 # This file
```

## Integration with GennyCraft

To integrate with your accounts API:

```tsx
import { BalanceCard } from '@/components';
import { useEffect, useState } from 'react';

function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [change, setChange] = useState(0);

  useEffect(() => {
    // Fetch from your accounts endpoint
    fetch('/api/accounts/summary/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setBalance(data.total_balance);
        setChange(data.month_change_percent);
      });
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <BalanceCard balance={balance} percentChange={change} />
    </div>
  );
}
```

## Accessibility

- ✅ ARIA labels on toggle button
- ✅ Keyboard accessible
- ✅ Screen reader friendly hidden state
- ✅ Semantic HTML structure

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers
