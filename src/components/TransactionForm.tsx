import React, { useState, useEffect } from 'react';
import { Category, TransactionCreate } from '../types';
import { categoriesApi } from '../api';

interface TransactionFormProps {
  initialData?: Partial<TransactionCreate>;
  onSubmit: (data: TransactionCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<TransactionCreate>({
    type: initialData?.type || 'expense',
    amount: initialData?.amount || '',
    currency: initialData?.currency || 'USD',
    date: initialData?.date || new Date().toISOString().slice(0, 16),
    category: initialData?.category || 0,
    title: initialData?.title || '',
    note: initialData?.note || '',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, [formData.type]);

  const loadCategories = async (): Promise<void> => {
    try {
      const allCategories = await categoriesApi.getAll();
      const filtered = allCategories.filter(
        (cat) => cat.type === formData.type || cat.type === 'both'
      );
      setCategories(filtered);

      // Set default category if not set
      if (!formData.category && filtered.length > 0) {
        setFormData((prev) => ({ ...prev, category: filtered[0].id }));
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'category' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.formGroup}>
        <label style={styles.label}>Type *</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Amount *</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="0.01"
          step="0.01"
          style={styles.input}
          placeholder="0.00"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Currency *</label>
        <input
          type="text"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
          maxLength={3}
          style={styles.input}
          placeholder="USD"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Date *</label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={200}
          style={styles.input}
          placeholder="e.g., Grocery shopping"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Note</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          rows={3}
          style={styles.textarea}
          placeholder="Optional notes..."
        />
      </div>

      <div style={styles.buttonGroup}>
        <button type="submit" disabled={isLoading} style={styles.submitButton}>
          {isLoading ? 'Saving...' : 'Save Transaction'}
        </button>
        <button type="button" onClick={onCancel} style={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  formGroup: {
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#333',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  } as React.CSSProperties,
  submitButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  } as React.CSSProperties,
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '500',
  } as React.CSSProperties,
  error: {
    padding: '1rem',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    marginBottom: '1rem',
  } as React.CSSProperties,
};

export default TransactionForm;
