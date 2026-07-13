import { create } from 'zustand';
import api from '../utils/axiosConfig';

export const useLedgerStore = create((set, get) => ({
  customers: [],
  currentCustomerTransactions: [],
  dashboardStats: null,
  isLoading: false,

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/customers');
      set({ customers: res.data });
    } catch (err) {
      console.error('Error loading directory files:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDashboardStats: async () => {
    try {
      const res = await api.get('/store/dashboard');
      set({ dashboardStats: res.data });
    } catch (err) {
      console.error('Error fetching analytics overview metrics:', err);
    }
  },

  addCustomer: async (customerData) => {
    try {
      const res = await api.post('/customers', customerData);
      set((state) => ({ customers: [res.data, ...state.customers] }));
      get().fetchDashboardStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Server connection error' };
    }
  },

  addTransaction: async (txData) => {
    try {
      const res = await api.post('/transactions', txData);
      get().fetchTransactionHistory(txData.customerId);
      get().fetchCustomers();
      get().fetchDashboardStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed log entry parameters' };
    }
  },

  fetchTransactionHistory: async (customerId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/transactions/${customerId}`);
      set({ currentCustomerTransactions: res.data });
    } catch (err) {
      console.error('Error pulling ledger history profile:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateStoreDetails: async (updatedData) => {
    try {
      await api.put('/store/update', updatedData);
      get().fetchDashboardStats();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Error updating settings' };
    }
  }
}));