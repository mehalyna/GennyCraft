# CashbackCard Component

Displays total cashback with breakdown of available and pending amounts. Features a gradient purple/pink background with percentage change indicator.

## Figma Design

- **Source:** [MyWallet - Cashback Card](https://www.figma.com/design/HWGRyv6qT6tnjIuE3o6TEl/MyWallet?node-id=6-183)
- **Screenshot:** `CashbackCard.figma.png`

## Usage

```tsx
import { CashbackCard } from '../components';

function MyPage() {
  return (
    <CashbackCard
      totalAmount={247.85}
      percentChange={12}
      changeDescription="this month"
      availableAmount={197.85}
      pendingAmount={50.00}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `totalAmount` | `number` | ✅ | - | Total cashback amount |
| `percentChange` | `number` | ✅ | - | Percentage change (can be negative) |
| `changeDescription` | `string` | ❌ | `"this month"` | Description of the change period |
| `availableAmount` | `number` | ✅ | - | Available amount for withdrawal |
| `pendingAmount` | `number` | ✅ | - | Pending amount awaiting confirmation |
| `className` | `string` | ❌ | - | Optional CSS class name |

## Design Tokens Used

- **Colors:** Primary gradient (`#ad46ff` → `#f6339a`), white text, overlay background
- **Typography:** Inter font, 36px for main amount, 20px for breakdown amounts
- **Spacing:** 24px padding, consistent gaps
- **Border Radius:** 14px card, 10px sub-cards

## Examples

### Basic Usage
```tsx
<CashbackCard
  totalAmount={247.85}
  percentChange={12}
  availableAmount={197.85}
  pendingAmount={50.00}
/>
```

### Negative Change
```tsx
<CashbackCard
  totalAmount={180.50}
  percentChange={-5.2}
  changeDescription="this week"
  availableAmount={150.50}
  pendingAmount={30.00}
/>
```

### Custom Period
```tsx
<CashbackCard
  totalAmount={1420.30}
  percentChange={25.8}
  changeDescription="this quarter"
  availableAmount={1200.30}
  pendingAmount={220.00}
/>
```

## Features

- ✅ Gradient background matching design system
- ✅ Gift icon in header
- ✅ Large, readable total amount
- ✅ Percentage change with up arrow indicator
- ✅ Two-column breakdown for available/pending amounts
- ✅ Fully responsive layout
- ✅ Type-safe props with TypeScript

## Component Structure

```
CashbackCard/
├── CashbackCard.tsx          # Main component
├── CashbackCard.types.ts     # TypeScript interfaces
├── index.ts                  # Re-exports
├── CashbackCard.figma.png    # Design reference
└── README.md                 # This file
```
