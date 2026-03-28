// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  timezone: string;
  locale: string;
  default_currency: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  timezone?: string;
  locale?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  is_active: boolean;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  type: 'income' | 'expense' | 'both';
  color?: string;
  icon?: string;
  is_active?: boolean;
}

// Transaction types
export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  currency: string;
  date: string;
  category: number;
  category_details?: Category;
  title: string;
  note: string;
  attachment: string | null;
  is_recurring: boolean;
  recurring_rule: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionList {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  currency: string;
  date: string;
  category_name: string;
  category_icon: string;
  title: string;
  created_at: string;
}

export interface TransactionCreate {
  type: 'income' | 'expense';
  amount: string;
  currency: string;
  date: string;
  category: number;
  title: string;
  note?: string;
  is_recurring?: boolean;
  recurring_rule?: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category?: number;
  date_after?: string;
  date_before?: string;
  amount_min?: string;
  amount_max?: string;
  search?: string;
}

// Report types
export interface SummaryReport {
  period: {
    start: string;
    end: string;
  };
  income: {
    total: number;
    count: number;
  };
  expense: {
    total: number;
    count: number;
  };
  balance: number;
}

export interface CategoryBreakdown {
  period: {
    start: string;
    end: string;
  };
  type: 'income' | 'expense';
  categories: Array<{
    category__name: string;
    category__color: string;
    category__icon: string;
    total: number;
    count: number;
  }>;
}

export interface TrendsReport {
  period: string;
  start: string;
  end: string;
  data: Array<{
    month: string;
    type: 'income' | 'expense';
    total: number;
    count: number;
  }>;
}

export interface DashboardData {
  current_balance: number;
  total_income: number;
  total_expense: number;
  recent_transactions: Array<{
    id: number;
    type: 'income' | 'expense';
    amount: number;
    date: string;
    category: string;
    title: string;
  }>;
}

// Account types
export interface Account {
  id: number;
  user: number;
  name: string;
  account_type: 'cash' | 'bank' | 'credit_card' | 'savings' | 'investment' | 'other';
  currency: string;
  balance: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
