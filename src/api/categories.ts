import apiClient from './client';
import { Category, CategoryCreate } from '../types';

export const categoriesApi = {
  // Get all categories (global + user's own)
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ results: Category[] }>('/categories/');
    return response.data.results || [];
  },

  // Get single category
  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/categories/${id}/`);
    return response.data;
  },

  // Create category
  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories/', data);
    return response.data;
  },

  // Update category
  update: async (id: number, data: Partial<CategoryCreate>): Promise<Category> => {
    const response = await apiClient.patch<Category>(`/categories/${id}/`, data);
    return response.data;
  },

  // Delete category
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}/`);
  },

  // Get income categories
  getIncomeCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/income/');
    return Array.isArray(response.data) ? response.data : [];
  },

  // Get expense categories
  getExpenseCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories/expense/');
    return Array.isArray(response.data) ? response.data : [];
  },
};
