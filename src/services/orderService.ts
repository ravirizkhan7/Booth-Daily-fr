import api from '../utils/axios';
import { Order } from '../types';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    const data = response.data;
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const response = await api.get(`/orders/${id}`);
    return response.data.data || response.data;
  },

  async createOrder(orderData: any): Promise<Order> {
    const response = await api.post('/orders', orderData);
    return response.data.data || response.data;
  }
};
