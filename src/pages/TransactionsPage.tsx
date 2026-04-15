import React, { useState, useEffect } from 'react';
import { transactionsApi, categoriesApi } from '../api';
import {
  TransactionList,
  TransactionCreate,
  TransactionFilters,
  Category,
  Transaction,
} from '../types';
import { Layout, TransactionForm } from '../components';

type ViewMode = 'list' | 'create' | 'edit';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filters
  const [filters, setFilters] = useState<TransactionFilters>({
    type: undefined,
    category: undefined,
    date_after: '',
    date_before: '',
    search: '',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const [transactionsResponse, categoriesData] = await Promise.all([
        transactionsApi.getAll(filters),
        categoriesApi.getAll(),
      ]);

      setTransactions(transactionsResponse.results);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load transactions');
      setCategories([]);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFilters((prev: TransactionFilters) => ({
      ...prev,
      [name]: value === '' ? undefined : name === 'category' ? Number(value) : value,
    }));
  };

  const handleCreateTransaction = async (data: TransactionCreate): Promise<void> => {
    try {
      await transactionsApi.create(data);
      setViewMode('list');
      loadData();
    } catch (err) {
      console.error('Failed to create transaction:', err);
      throw err;
    }
  };

  const handleUpdateTransaction = async (data: TransactionCreate): Promise<void> => {
    if (!editingTransaction) return;

    try {
      await transactionsApi.update(editingTransaction.id, data);
      setViewMode('list');
      setEditingTransaction(null);
      loadData();
    } catch (err) {
      console.error('Failed to update transaction:', err);
      throw err;
    }
  };

  const handleDeleteTransaction = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await transactionsApi.delete(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError('Failed to delete transaction');
    }
  };

  const handleEditClick = async (id: number): Promise<void> => {
    try {
      const transaction = await transactionsApi.getById(id);
      setEditingTransaction(transaction);
      setViewMode('edit');
    } catch (err) {
      console.error('Failed to load transaction:', err);
      setError('Failed to load transaction details');
    }
  };

  const handleExportCsv = async (): Promise<void> => {
    try {
      const blob = await transactionsApi.exportCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError('Failed to export transactions');
    }
  };

  const clearFilters = (): void => {
    setFilters({
      type: undefined,
      category: undefined,
      date_after: '',
      date_before: '',
      search: '',
    });
  };

  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
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

  if (viewMode === 'create') {
    return (
      <Layout>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Add Transaction</h1>
          <TransactionForm
            onSubmit={handleCreateTransaction}
            onCancel={() => setViewMode('list')}
          />
        </div>
      </Layout>
    );
  }

  if (viewMode === 'edit' && editingTransaction) {
    return (
      <Layout>
        <div style={styles.container}>
          <h1 style={styles.pageTitle}>Edit Transaction</h1>
          <TransactionForm
            initialData={{
              type: editingTransaction.type,
              amount: editingTransaction.amount,
              currency: editingTransaction.currency,
              date: editingTransaction.date.slice(0, 16),
              category: editingTransaction.category,
              title: editingTransaction.title,
              note: editingTransaction.note,
            }}
            onSubmit={handleUpdateTransaction}
            onCancel={() => {
              setViewMode('list');
              setEditingTransaction(null);
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Transactions</h1>
          <div style={styles.headerButtons}>
            <button onClick={handleExportCsv} style={styles.exportButton}>
              Export CSV
            </button>
            <button onClick={() => setViewMode('create')} style={styles.addButton}>
              + Add Transaction
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Filters */}
        <div style={styles.filtersCard}>
          <h3 style={styles.filtersTitle}>Filters</h3>
          <div style={styles.filtersGrid}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Type</label>
              <select
                name="type"
                value={filters.type || ''}
                onChange={handleFilterChange}
                style={styles.filterSelect}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Category</label>
              <select
                name="category"
                value={filters.category || ''}
                onChange={handleFilterChange}
                style={styles.filterSelect}
              >
                <option value="">All Categories</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>From Date</label>
              <input
                type="date"
                name="date_after"
                value={filters.date_after || ''}
                onChange={handleFilterChange}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>To Date</label>
              <input
                type="date"
                name="date_before"
                value={filters.date_before || ''}
                onChange={handleFilterChange}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search || ''}
                onChange={handleFilterChange}
                placeholder="Search title or notes..."
                style={styles.filterInput}
              />
            </div>

            <div style={{ ...styles.filterGroup, alignSelf: 'flex-end' }}>
              <button onClick={clearFilters} style={styles.clearButton}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div style={styles.loading}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No transactions found</p>
            <button onClick={() => setViewMode('create')} style={styles.addButton}>
              Add your first transaction
            </button>
          </div>
        ) : (
          <div style={styles.transactionsList}>
            {transactions.map((transaction: TransactionList) => (
              <div key={transaction.id} style={styles.transactionCard}>
                <div style={styles.transactionMain}>
                  <div style={styles.transactionIcon}>{transaction.category_icon}</div>
                  <div style={styles.transactionInfo}>
                    <span style={styles.transactionTitle}>{transaction.title}</span>
                    <span style={styles.transactionMeta}>
                      {transaction.category_name} • {formatDate(transaction.date)}
                    </span>
                  </div>
                </div>
                <div style={styles.transactionRight}>
                  <span
                    style={{
                      ...styles.transactionAmount,
                      color: transaction.type === 'income' ? '#27ae60' : '#e74c3c',
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <div style={styles.transactionActions}>
                    <button
                      onClick={() => handleEditClick(transaction.id)}
                      style={styles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    flexWrap: 'wrap',
    gap: '1rem',
  } as React.CSSProperties,
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
  } as React.CSSProperties,
  headerButtons: {
    display: 'flex',
    gap: '1rem',
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
  exportButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  } as React.CSSProperties,
  filtersCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  filtersTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  } as React.CSSProperties,
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  filterLabel: {
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#2c3e50',
    fontWeight: '500',
  } as React.CSSProperties,
  filterInput: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  filterSelect: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
    backgroundColor: 'white',
  } as React.CSSProperties,
  clearButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '500',
  } as React.CSSProperties,
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as React.CSSProperties,
  transactionCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  } as React.CSSProperties,
  transactionMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
  } as React.CSSProperties,
  transactionIcon: {
    fontSize: '2rem',
    width: '3rem',
    height: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '50%',
  } as React.CSSProperties,
  transactionInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  } as React.CSSProperties,
  transactionTitle: {
    fontWeight: '500',
    color: '#2c3e50',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  transactionMeta: {
    fontSize: '0.9rem',
    color: '#7f8c8d',
  } as React.CSSProperties,
  transactionRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  } as React.CSSProperties,
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: '1.25rem',
  } as React.CSSProperties,
  transactionActions: {
    display: 'flex',
    gap: '0.5rem',
  } as React.CSSProperties,
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
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
    marginBottom: '1rem',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
};

export default TransactionsPage;
