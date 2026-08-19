import api from './api';
import { ApiResponse, Category, Pagination, Product, SupplierRef } from '@/types';

export const productService = {
  getProducts: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<{ products: Product[]; pagination: Pagination }>>('/products', { params })
      .then((r) => r.data.data),

  getProduct: (id: string) =>
    api.get<ApiResponse<Product>>(`/products/${id}`).then((r) => r.data.data),

  getFeatured: () =>
    api.get<ApiResponse<Product[]>>('/products/featured').then((r) => r.data.data),

  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/categories').then((r) => r.data.data),

  getSuppliers: () =>
    api.get<ApiResponse<SupplierRef[]>>('/suppliers').then((r) => r.data.data),

  updateLike: (id: string) =>
    api.post<ApiResponse<{ liked: boolean; likeCount: number }>>(`/products/${id}/like`)
      .then((r) => r.data.data),
};
