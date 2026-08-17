import api from './api';
import { ApiResponse, Cart, DeliveryAddress, Order, Pagination } from '@/types';

export const cartService = {
  getCart: () => api.get<ApiResponse<Cart>>('/cart').then((r) => r.data.data),
  addItem: (productId: string, quantity = 1) =>
    api.post<ApiResponse<Cart>>('/cart', { productId, quantity }).then((r) => r.data.data),
  updateItem: (productId: string, quantity: number) =>
    api.put<ApiResponse<Cart>>(`/cart/${productId}`, { quantity }).then((r) => r.data.data),
  removeItem: (productId: string) =>
    api.delete<ApiResponse<Cart>>(`/cart/${productId}`).then((r) => r.data.data),
  clearCart: () =>
    api.delete<ApiResponse<Cart>>('/cart').then((r) => r.data.data),
};

export const orderService = {
  checkout: (deliveryAddress: DeliveryAddress, paymentMethod: string) =>
    api.post<ApiResponse<Order>>('/checkout', { deliveryAddress, paymentMethod }).then((r) => r.data.data),

  getOrders: (page = 1) =>
    api.get<ApiResponse<{ orders: Order[]; pagination: Pagination }>>('/orders', { params: { page } })
      .then((r) => r.data.data),

  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data.data),

  buyAgain: (id: string) =>
    api.post<ApiResponse<Cart>>(`/orders/${id}/buy-again`).then((r) => r.data.data),
};
