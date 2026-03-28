import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../api';
import { DashboardData, CategoryBreakdown } from '../types';
import { Layout } from '../components';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [periodType, setPeriodType] = useState<'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [periodType]);

  const loadDashboardData = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const [dashboard, breakdown] = await Promise.all([
        reportsApi.getDashboard(),
        reportsApi.getCategoryBreakdown('expense'),
      ]);

      setDashboardData(dashboard);
      setCategoryBreakdown(breakdown);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={styles.loading}>Loading dashboard...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={styles.error}>{error}</div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div>No data available</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <button onClick={() => navigate('/transactions')} style={styles.addButton}>
            + Add Transaction
          </button>
        </div>

        {/* Balance Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, ...styles.balanceCard }}>
            <h3 style={styles.statLabel}>Current Balance</h3>
            <p style={styles.statValue}>{formatCurrency(dashboardData.current_balance)}</p>
          </div>

          <div style={{ ...styles.statCard, ...styles.incomeCard }}>
            <h3 style={styles.statLabel}>Total Income</h3>
            <p style={styles.statValue}>{formatCurrency(dashboardData.total_income)}</p>
          </div>

          <div style={{ ...styles.statCard, ...styles.expenseCard }}>
            <h3 style={styles.statLabel}>Total Expenses</h3>
            <p style={styles.statValue}>{formatCurrency(dashboardData.total_expense)}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown && categoryBreakdown.categories.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Top Expense Categories</h2>
            <div style={styles.categoryList}>
              {categoryBreakdown.categories.slice(0, 5).map((cat, index) => (
                <div key={index} style={styles.categoryItem}>
                  <div style={styles.categoryInfo}>
                    <span style={styles.categoryIcon}>{cat.category__icon}</span>
                    <span style={styles.categoryName}>{cat.category__name}</span>
                    <span style={styles.categoryCount}>({cat.count} transactions)</span>
                  </div>
                  <span style={styles.categoryAmount}>{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Transactions</h2>
          {dashboardData.recent_transactions.length === 0 ? (
            <p style={styles.emptyState}>No transactions yet. Start tracking your finances!</p>
          ) : (
            <div style={styles.transactionList}>
              {dashboardData.recent_transactions.map((transaction) => (
                <div key={transaction.id} style={styles.transactionItem}>
                  <div style={styles.transactionInfo}>
                    <span style={styles.transactionTitle}>{transaction.title}</span>
                    <span style={styles.transactionMeta}>
                      {transaction.category} • {formatDate(transaction.date)}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.transactionAmount,
                      color: transaction.type === 'income' ? '#27ae60' : '#e74c3c',
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  } as React.CSSProperties,
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
  } as React.CSSProperties,
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  statCard: {
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  balanceCard: {
    backgroundColor: '#3498db',
    color: 'white',
  } as React.CSSProperties,
  incomeCard: {
    backgroundColor: '#27ae60',
    color: 'white',
  } as React.CSSProperties,
  expenseCard: {
    backgroundColor: '#e74c3c',
    color: 'white',
  } as React.CSSProperties,
  statLabel: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 'normal',
    opacity: 0.9,
  } as React.CSSProperties,
  statValue: {
    margin: '0.5rem 0 0 0',
    fontSize: '2rem',
    fontWeight: 'bold',
  } as React.CSSProperties,
  section: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 0,
    marginBottom: '1rem',
  } as React.CSSProperties,
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  } as React.CSSProperties,
  categoryInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as React.CSSProperties,
  categoryIcon: {
    fontSize: '1.5rem',
  } as React.CSSProperties,
  categoryName: {
    fontWeight: '500',
    color: '#2c3e50',
  } as React.CSSProperties,
  categoryCount: {
    fontSize: '0.85rem',
    color: '#7f8c8d',
  } as React.CSSProperties,
  categoryAmount: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  transactionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  } as React.CSSProperties,
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  } as React.CSSProperties,
  transactionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  } as React.CSSProperties,
  transactionTitle: {
    fontWeight: '500',
    color: '#2c3e50',
  } as React.CSSProperties,
  transactionMeta: {
    fontSize: '0.85rem',
    color: '#7f8c8d',
  } as React.CSSProperties,
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#7f8c8d',
  } as React.CSSProperties,
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center',
    color: '#7f8c8d',
    padding: '2rem',
  } as React.CSSProperties,
};

export default DashboardPage;
