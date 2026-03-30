/**
 * Accounts API
 * Endpoints for managing user financial accounts
 */

import apiClient from './client';
import { Account, PaginatedResponse } from '../types';

export const accountsApi = {
  /**
   * Get all accounts for the authenticated user
   */
  getAccounts: async (): Promise<Account[]> => {
    const response = await apiClient.get<PaginatedResponse<Account>>('/accounts/accounts/');
    return response.data.results;
  },

  /**
   * Get a single account by ID
   */
  getAccount: async (id: number): Promise<Account> => {
    const response = await apiClient.get<Account>(`/accounts/accounts/${id}/`);
    return response.data;
  },

  /**
   * Create a new account
   */
  createAccount: async (account: Partial<Account>): Promise<Account> => {
    const response = await apiClient.post<Account>('/accounts/accounts/', account);
    return response.data;
  },

  /**
   * Update an existing account
   */
  updateAccount: async (id: number, account: Partial<Account>): Promise<Account> => {
    const response = await apiClient.patch<Account>(`/accounts/accounts/${id}/`, account);
    return response.data;
  },

  /**
   * Delete an account
   */
  deleteAccount: async (id: number): Promise<void> => {
    await apiClient.delete(`/accounts/accounts/${id}/`);
  },

  /**
   * Get account summary with total balance across all accounts
   */
  getSummary: async (): Promise<{ total_balance: number; account_count: number; accounts: Account[] }> => {
    const accounts = await accountsApi.getAccounts();
    const activeAccounts = accounts.filter(acc => acc.is_active);
    
    const totalBalance = activeAccounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance);
    }, 0);

    return {
      total_balance: totalBalance,
      account_count: activeAccounts.length,
      accounts: activeAccounts,
    };
  },
};
