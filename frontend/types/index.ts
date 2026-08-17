export type UserRole = 'customer' | 'supplier' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
}

export interface SupplierRef {
  _id: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  status?: 'active' | 'suspended';
}

export type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived' | 'inactive';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  brand?: string;
  description: string;
  price: number;
  cost?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  imageUrls: string[];
  status: ProductStatus;
  categoryId: Category;
  supplierId: SupplierRef;
  createdAt: string;
}

export interface SupplierProfile {
  _id: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  categoryIds?: Category[];
  contactEmail?: string;
  contactPhone?: string;
  businessAddress?: string;
  registrationNumber?: string;
  verificationStatus?: 'verified' | 'unverified';
  status: 'active' | 'suspended';
  user?: User;
}

export interface SupplierDashboardMetrics {
  totalSales: number;
  totalOrders: number;
  grossRevenue: number;
  platformFees: number;
  netRevenue: number;
  estimatedProfit: number;
  activeProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface SupplierFinancials {
  grossSales: number;
  platformCommission: number;
  netRevenue: number;
  cogs: number;
  estimatedProfit: number;
  unitsSold: number;
  orderCount: number;
  averageOrderValue: number;
  commissionRate?: number;
  revenue?: number;
  grossProfit?: number;
}

export interface CartItem {
  productId: Product;
  supplierId: SupplierRef;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateRegion?: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  nameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  unitCost?: number;
  quantity: number;
  lineTotal: number;
}

export interface SupplierOrder {
  _id?: string;
  supplierId: SupplierRef;
  items: OrderItem[];
  subtotal: number;
  fulfillmentStatus: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: User | string;
  supplierOrders: SupplierOrder[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export type IntegrationConfigType = 'trigger' | 'admin_widget' | 'customer_widget' | 'supplier_widget';

export interface IntegrationConfig {
  _id: string;
  type: IntegrationConfigType;
  url: string;
  token: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationConfiguration {
  trigger: IntegrationConfig | null;
  adminWidget: IntegrationConfig | null;
  customerWidget: IntegrationConfig | null;
  supplierWidget: IntegrationConfig | null;
}

export interface SupplierApplication {
  _id: string;
  storeName: string;
  contactName: string;
  email: string;
  phone: string;
  description?: string;
  categories?: string[];
  website?: string;
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  adminNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface LoginResponse {
  user: User;
  token: string;
  supplierStatus?: string | null;
}
