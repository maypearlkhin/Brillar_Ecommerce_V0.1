import api from './api';
import { ApiResponse, Product, FAQ } from '@/types';

export interface HomeCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl: string | null;
  productCount: number;
}

export interface HomeData {
  stats: { productCount: number; supplierCount: number; categoryCount: number };
  featured: Product[];
  categories: HomeCategory[];
  faqs: FAQ[];
}

export const homeService = {
  getHomeData: () =>
    api.get<ApiResponse<HomeData>>('/home').then((r) => r.data.data),
};
