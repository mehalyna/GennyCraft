import apiClient from './client';
import { SummaryReport, CategoryBreakdown, TrendsReport, DashboardData } from '../types';

export const reportsApi = {
  // Get financial summary
  getSummary: async (start?: string, end?: string): Promise<SummaryReport> => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const response = await apiClient.get<SummaryReport>(
      `/reports/summary/?${params.toString()}`
    );
    return response.data;
  },

  // Get category breakdown
  getCategoryBreakdown: async (
    type: 'income' | 'expense',
    start?: string,
    end?: string
  ): Promise<CategoryBreakdown> => {
    const params = new URLSearchParams();
    params.append('type', type);
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const response = await apiClient.get<CategoryBreakdown>(
      `/reports/category-breakdown/?${params.toString()}`
    );
    return response.data;
  },

  // Get trends
  getTrends: async (
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    months: number = 6
  ): Promise<TrendsReport> => {
    const params = new URLSearchParams();
    params.append('period', period);
    params.append('months', months.toString());

    const response = await apiClient.get<TrendsReport>(
      `/reports/trends/?${params.toString()}`
    );
    return response.data;
  },

  // Get dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<DashboardData>('/reports/dashboard/');
    return response.data;
  },
};
