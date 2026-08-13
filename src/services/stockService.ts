import api from '../utils/axios';
import { Stock, StockHistory, Purchase } from '../types';

export const stockService = {
  async getStocks(): Promise<Stock[]> {
    const response = await api.get('/stocks');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getStockHistories(): Promise<StockHistory[]> {
    // Backend does not have a global GET /stock-histories endpoint.
    // Stock histories are available per-stock via GET /stocks/{id}/histories.
    // Return empty array — this is NOT a fallback to dummy data.
    console.warn('GET /stock-histories: no global endpoint available in backend. Use getStockHistoriesForStock(stockId) instead.');
    return [];
  },

  async getStockHistoriesForStock(stockId: string): Promise<StockHistory[]> {
    const response = await api.get(`/stocks/${stockId}/histories`);
    const data = response.data;
    if (data.data && data.data.data) {
      // Paginated response: data.data is the paginator, data.data.data is the items array
      return data.data.data;
    }
    return Array.isArray(data.data) ? data.data : (data.data || []);
  },

  async getPurchases(): Promise<Purchase[]> {
    const response = await api.get('/purchases');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  // Stock CRUD — all via backend API
  async createStock(stockData: Omit<Stock, 'id'>): Promise<Stock> {
    const response = await api.post('/stocks', stockData);
    return response.data.data || response.data;
  },

  async updateStock(id: string, stockData: Partial<Stock>): Promise<Stock> {
    const response = await api.put(`/stocks/${id}`, stockData);
    return response.data.data || response.data;
  },

  async deleteStock(id: string): Promise<boolean> {
    await api.delete(`/stocks/${id}`);
    return true;
  },

  // Stock Adjustment via backend
  async adjustStock(
    stockId: string,
    changeAmount: number,
    reason: string,
    _userName: string = 'Owner'
  ): Promise<Stock> {
    const response = await api.post(`/stocks/${stockId}/adjust`, {
      change_amount: changeAmount,
      reference: reason,
    });
    return response.data.data || response.data;
  },

  // Purchase Management CRUD — all via backend API
  async createPurchase(purchaseData: Omit<Purchase, 'id'>): Promise<Purchase> {
    const response = await api.post('/purchases', purchaseData);
    return response.data.data || response.data;
  },

  // Note: Backend does not have PUT /purchases/{id} — only store and destroy.
  // If update is needed, backend must add the route.
  async updatePurchase(id: string, purchaseData: Partial<Purchase>): Promise<Purchase> {
    const response = await api.put(`/purchases/${id}`, purchaseData);
    return response.data.data || response.data;
  },

  async deletePurchase(id: string): Promise<boolean> {
    await api.delete(`/purchases/${id}`);
    return true;
  }
};
