import apiClient from './client';
import {
  Transaction,
  TransactionList,
  TransactionCreate,
  TransactionFilters,
  PaginatedResponse,
} from '../types';

export const transactionsApi = {
  // Get all transactions with optional filters
  getAll: async (filters?: TransactionFilters): Promise<PaginatedResponse<TransactionList>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponse<TransactionList>>(
      `/transactions/?${params.toString()}`
    );
    return response.data;
  },

  // Get single transaction
  getById: async (id: number): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(`/transactions/${id}/`);
    return response.data;
  },

  // Create transaction
  create: async (data: TransactionCreate): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>('/transactions/', data);
    return response.data;
  },

  // Update transaction
  update: async (id: number, data: Partial<TransactionCreate>): Promise<Transaction> => {
    const response = await apiClient.patch<Transaction>(`/transactions/${id}/`, data);
    return response.data;
  },

  // Delete transaction (soft delete)
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}/`);
  },

  // Export to CSV
  exportCsv: async (filters?: TransactionFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get(`/transactions/export/?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Attach file to transaction
  attachFile: async (id: number, file: File): Promise<Transaction> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Transaction>(
      `/transactions/${id}/attach_file/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Remove attachment
  removeAttachment: async (id: number): Promise<void> => {
    await apiClient.delete(`/transactions/${id}/remove_attachment/`);
  },
};
