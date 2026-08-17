import api from './api';
import {
  ApiResponse,
  FAQ,
  IntegrationConfiguration,
  IntegrationConfig,
  IntegrationConfigType,
  Order,
  Pagination,
  Product,
  SupplierApplication,
  SupplierDashboardMetrics,
  SupplierFinancials,
  SupplierProfile,
  Category,
} from '@/types';

export interface SupplierDashboardData {
  metrics: SupplierDashboardMetrics;
  recentOrders: Array<Record<string, unknown>>;
  lowStockProducts: Product[];
  topSellingProducts: Array<{ name: string; units: number; revenue: number }>;
}

export interface InventorySummary {
  totalSkus: number;
  lowStock: number;
  outOfStock: number;
}

export const supplierService = {
  submitApplication: (data: Record<string, unknown>) =>
    api.post<ApiResponse<SupplierApplication>>('/supplier/application', data).then((r) => r.data.data),

  getMyApplication: () =>
    api.get<ApiResponse<SupplierApplication | null>>('/supplier/application').then((r) => r.data.data),

  getDashboard: () =>
    api.get<ApiResponse<SupplierDashboardData>>('/supplier/dashboard').then((r) => r.data.data),

  getProfile: () =>
    api.get<ApiResponse<SupplierProfile>>('/supplier/profile').then((r) => r.data.data),

  updateProfile: (data: Record<string, unknown>) =>
    api.put<ApiResponse<SupplierProfile>>('/supplier/profile', data).then((r) => r.data.data),

  getCategories: () =>
    api.get<ApiResponse<Category[]>>('/supplier/categories').then((r) => r.data.data),

  getProducts: (params?: { page?: number; search?: string; status?: string }) =>
    api.get<ApiResponse<{ products: Product[]; pagination: Pagination }>>('/supplier/products', { params })
      .then((r) => r.data.data),

  createProduct: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Product>>('/supplier/products', data).then((r) => r.data.data),

  updateProduct: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Product>>(`/supplier/products/${id}`, data).then((r) => r.data.data),

  archiveProduct: (id: string) =>
    api.patch<ApiResponse<Product>>(`/supplier/products/${id}/archive`).then((r) => r.data.data),

  getInventory: (page = 1) =>
    api.get<ApiResponse<{ products: Product[]; summary: InventorySummary; pagination: Pagination }>>(
      '/supplier/inventory',
      { params: { page } }
    ).then((r) => r.data.data),

  updateStock: (id: string, stockQuantity: number) =>
    api.patch<ApiResponse<Product>>(`/supplier/inventory/${id}/stock`, { stockQuantity })
      .then((r) => r.data.data),

  getOrders: (page = 1) =>
    api.get<ApiResponse<{ orders: Order[]; pagination: Pagination }>>('/supplier/orders', { params: { page } })
      .then((r) => r.data.data),

  updateFulfillment: (orderId: string, fulfillmentStatus: string) =>
    api.patch<ApiResponse<Order>>(`/supplier/orders/${orderId}/fulfillment`, { fulfillmentStatus })
      .then((r) => r.data.data),

  getFinancials: () =>
    api.get<ApiResponse<SupplierFinancials>>('/supplier/financials').then((r) => r.data.data),

  getEarnings: () =>
    api.get<ApiResponse<SupplierFinancials>>('/supplier/earnings').then((r) => r.data.data),

  uploadProductImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post<ApiResponse<{ urls: string[] }>>('/supplier/uploads/product-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data.urls);
  },
};

export const adminService = {
  getDashboard: () => api.get<ApiResponse<Record<string, unknown>>>('/admin/dashboard').then((r) => r.data.data),

  getApplications: (status?: string, page = 1) =>
    api.get<ApiResponse<{ applications: SupplierApplication[]; pagination: Pagination }>>(
      '/admin/supplier-applications', { params: { status, page } }
    ).then((r) => r.data.data),

  getApplication: (id: string) =>
    api.get<ApiResponse<SupplierApplication>>(`/admin/supplier-applications/${id}`).then((r) => r.data.data),

  approveApplication: (id: string) =>
    api.post<ApiResponse<SupplierApplication>>(`/admin/supplier-applications/${id}/approve`).then((r) => r.data.data),

  rejectApplication: (id: string, adminNote: string) =>
    api.post<ApiResponse<SupplierApplication>>(`/admin/supplier-applications/${id}/reject`, { adminNote })
      .then((r) => r.data.data),

  requestMoreInfo: (id: string, adminNote: string) =>
    api.post<ApiResponse<SupplierApplication>>(`/admin/supplier-applications/${id}/request-info`, { adminNote })
      .then((r) => r.data.data),

  getSuppliers: (status?: string, page = 1) =>
    api.get<ApiResponse<{ suppliers: Record<string, unknown>[]; pagination: Pagination }>>(
      '/admin/suppliers', { params: { status, page } }
    ).then((r) => r.data.data),

  createSupplier: (data: Record<string, unknown>) =>
    api.post<ApiResponse<Record<string, unknown>>>('/admin/suppliers', data).then((r) => r.data.data),

  createCategory: (name: string) =>
    api.post<ApiResponse<Category>>('/admin/categories', { name }).then((r) => r.data.data),

  suspendSupplier: (id: string) =>
    api.post<ApiResponse<Record<string, unknown>>>(`/admin/suppliers/${id}/suspend`).then((r) => r.data.data),

  reactivateSupplier: (id: string) =>
    api.post<ApiResponse<Record<string, unknown>>>(`/admin/suppliers/${id}/reactivate`).then((r) => r.data.data),

  getCustomers: (search?: string, page = 1) =>
    api.get<ApiResponse<{ customers: Record<string, unknown>[]; pagination: Pagination }>>(
      '/admin/customers', { params: { search, page } }
    ).then((r) => r.data.data),

  getCustomer: (id: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(`/admin/customers/${id}`).then((r) => r.data.data),

  toggleCustomerStatus: (id: string) =>
    api.patch<ApiResponse<Record<string, unknown>>>(`/admin/customers/${id}/toggle-status`).then((r) => r.data.data),

  getOrders: (page = 1, status?: string) =>
    api.get<ApiResponse<{ orders: Order[]; pagination: Pagination }>>('/admin/orders', { params: { page, status } })
      .then((r) => r.data.data),

  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(`/admin/orders/${id}`).then((r) => r.data.data),

  getFAQs: () => api.get<ApiResponse<FAQ[]>>('/admin/faqs').then((r) => r.data.data),

  createFAQ: (data: Record<string, unknown>) =>
    api.post<ApiResponse<FAQ>>('/admin/faqs', data).then((r) => r.data.data),

  updateFAQ: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<FAQ>>(`/admin/faqs/${id}`, data).then((r) => r.data.data),

  deleteFAQ: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/faqs/${id}`).then((r) => r.data.data),

  getConfiguration: () =>
    api.get<ApiResponse<IntegrationConfiguration>>('/admin/configuration').then((r) => r.data.data),

  createConfiguration: (data: { type: IntegrationConfigType; url: string; token: string }) =>
    api.post<ApiResponse<IntegrationConfig>>('/admin/configuration', data).then((r) => r.data.data),

  deleteConfiguration: (type: IntegrationConfigType) =>
    api.delete<ApiResponse<null>>(`/admin/configuration/${type}`).then((r) => r.data.data),
};

export const faqService = {
  getPublicFAQs: () => api.get<ApiResponse<FAQ[]>>('/faq').then((r) => r.data.data),
};
