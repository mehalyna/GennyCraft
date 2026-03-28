# Home Wallet - Frontend

React TypeScript frontend for the Home Wallet personal finance management application.

## Tech Stack

- React 18
- TypeScript (strict mode)
- React Router v6
- Axios for API calls
- CSS-in-JS with inline styles

## Project Structure

```
src/
├── pages/              # 3 main pages
│   ├── LoginPage.tsx       # Login & Registration
│   ├── DashboardPage.tsx   # Dashboard with summary
│   └── TransactionsPage.tsx # Transactions CRUD
├── components/         # Shared components
│   ├── Layout.tsx          # App layout with navigation
│   ├── PrivateRoute.tsx    # Route authentication guard
│   └── TransactionForm.tsx # Reusable transaction form
├── api/                # API client
│   ├── client.ts           # Axios instance with JWT interceptors
│   ├── auth.ts             # Authentication endpoints
│   ├── categories.ts       # Categories endpoints
│   ├── transactions.ts     # Transactions endpoints
│   └── reports.ts          # Reports endpoints
├── types/              # TypeScript types
│   └── index.ts            # All type definitions
└── App.tsx             # Main app with routing
```

## Features

### 1. Login/Register Page
- Login form with email and password
- Registration form with validation
- JWT token management
- Automatic redirect after login

### 2. Dashboard Page
- Current balance display
- Total income and expenses
- Top expense categories breakdown
- Recent transactions list (last 10)
- Quick "Add Transaction" button

### 3. Transactions Page
- Filterable transaction list
  - Filter by type (income/expense)
  - Filter by category
  - Filter by date range
  - Search by text
- Add/Edit/Delete transactions
- Export to CSV
- Pagination support

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend server running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```
REACT_APP_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

The production build will be in the `build/` folder.

## API Integration

The frontend integrates with the Django backend API:

- **Base URL**: `http://localhost:8000/api` (configurable via `REACT_APP_API_URL`)
- **Authentication**: JWT Bearer tokens stored in localStorage
- **Token Refresh**: Automatic refresh on 401 responses

### API Endpoints Used

- `POST /auth/register/` - User registration
- `POST /auth/login/` - Login (get tokens)
- `POST /auth/token/refresh/` - Refresh access token
- `POST /auth/logout/` - Logout
- `GET /auth/profile/` - Get user profile
- `GET /categories/` - List categories
- `GET /transactions/` - List transactions (with filters)
- `POST /transactions/` - Create transaction
- `PATCH /transactions/{id}/` - Update transaction
- `DELETE /transactions/{id}/` - Delete transaction
- `GET /transactions/export/` - Export CSV
- `GET /reports/dashboard/` - Dashboard data
- `GET /reports/category-breakdown/` - Category breakdown

## Authentication Flow

1. User logs in → receives JWT access + refresh tokens
2. Tokens stored in localStorage
3. Access token sent in `Authorization: Bearer <token>` header
4. On 401 error → automatically refresh token
5. If refresh fails → redirect to login

## Type Safety

All API responses are strictly typed:
- No `any` types used
- Backend models mapped to TypeScript interfaces
- Full type checking enabled in `tsconfig.json`

## Styling

Currently using inline styles (CSS-in-JS) for simplicity. Can be easily replaced with:
- CSS Modules
- Styled Components
- Tailwind CSS
- Material-UI

## Future Enhancements

- Account management (multiple wallets)
- Charts and visualizations
- Budget tracking
- Recurring transactions UI
- File attachment upload
- Mobile responsive improvements
- Dark mode

## License

[Your License Here]
