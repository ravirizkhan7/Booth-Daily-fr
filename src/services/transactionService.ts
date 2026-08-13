import { orderService } from './orderService';
import { Order, PaymentMethod, OrderType, OrderItem, User } from '../types';

export interface CreateTransactionPayload {
  order_type: OrderType;
  items: Omit<OrderItem, 'id' | 'subtotal'>[];
  payment_method: PaymentMethod;
  amount_paid: number;
  customer_name?: string;
  user: User; // Authenticated by PIN
}

export const transactionService = {
  async processTransaction(payload: CreateTransactionPayload): Promise<Order> {
    // Send order directly to backend POST /orders
    // Backend handles: order_number, stock deduction, payment, tax calculation
    const orderPayload = {
      order_type: payload.order_type,
      customer_name: payload.customer_name || (payload.order_type === 'dine_in' ? 'Dine In' : 'Take Away'),
      items: payload.items.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        notes: item.notes || '',
      })),
      payment: {
        method: payload.payment_method,
        amount_paid: payload.amount_paid,
      },
    };

    const newOrder = await orderService.createOrder(orderPayload);
    return newOrder;
  }
};
