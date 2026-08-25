import { defineTool } from '@copilotkit/runtime/v2';
import { z } from 'zod';
import { backendFetch, toToolError } from './backendClient';

export function createPublicTools() {
  const searchProducts = defineTool({
    name: 'search_products',
    description: 'Search and filter marketplace products.',
    parameters: z.object({
      search: z.string().optional().describe('Free-text search query'),
      category: z.string().optional().describe('Category slug or name'),
      supplier: z.string().optional().describe('Supplier id or slug'),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      inStock: z.boolean().optional(),
      sort: z.enum(['price_asc', 'price_desc', 'name']).optional(),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(24).optional(),
    }),
    execute: async (params) => {
      try {
        return await backendFetch('/products', { params });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getProductDetails = defineTool({
    name: 'get_product_details',
    description: 'Get full details for a single product by id.',
    parameters: z.object({
      productId: z.string().min(1),
    }),
    execute: async ({ productId }) => {
      try {
        return await backendFetch(`/products/${productId}`);
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getFeaturedProducts = defineTool({
    name: 'get_featured_products',
    description: 'Get featured marketplace products.',
    parameters: z.object({}),
    execute: async () => {
      try {
        return await backendFetch('/products/featured');
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const listCategories = defineTool({
    name: 'list_categories',
    description: 'List product categories available on the marketplace.',
    parameters: z.object({}),
    execute: async () => {
      try {
        return await backendFetch('/categories');
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const listSuppliers = defineTool({
    name: 'list_suppliers',
    description: 'List active suppliers on the marketplace.',
    parameters: z.object({}),
    execute: async () => {
      try {
        return await backendFetch('/suppliers');
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getFaqs = defineTool({
    name: 'get_faqs',
    description: 'Get public FAQs about orders, payments, returns, and account help.',
    parameters: z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(50).optional(),
    }),
    execute: async (params) => {
      try {
        return await backendFetch('/faq', { params });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getHomepage = defineTool({
    name: 'get_homepage',
    description: 'Get homepage highlights: stats, featured products, categories, and top FAQs.',
    parameters: z.object({}),
    execute: async () => {
      try {
        return await backendFetch('/home');
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  return [
    searchProducts,
    getProductDetails,
    getFeaturedProducts,
    listCategories,
    listSuppliers,
    getFaqs,
    getHomepage,
  ];
}
