import { z } from 'zod';
import type { CatalogDefinitions } from '@copilotkit/a2ui-renderer';

const productShape = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().optional(),
  inStock: z.boolean(),
  supplierName: z.string().optional(),
  productUrl: z.string().optional(),
});

const cartItemShape = z.object({
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
});

export const catalogDefinitions = {
  ProductCard: {
    description: 'A single marketplace product card with image, price, stock, and supplier.',
    props: productShape,
  },
  ProductList: {
    description: 'A titled list or grid of marketplace products.',
    props: z.object({
      title: z.string().optional(),
      products: z.array(productShape),
    }),
  },
  CartSummary: {
    description: 'Shopping cart summary with line items and subtotal.',
    props: z.object({
      title: z.string().optional(),
      items: z.array(cartItemShape),
      subtotal: z.number(),
      itemCount: z.number(),
    }),
  },
  OrderStatusCard: {
    description: 'Order tracking card with status, total, and summary.',
    props: z.object({
      orderNumber: z.string(),
      status: z.string(),
      total: z.number(),
      createdAt: z.string(),
      itemSummary: z.string().optional(),
      orderUrl: z.string().optional(),
    }),
  },
  FaqItem: {
    description: 'A single FAQ question and answer card.',
    props: z.object({
      question: z.string(),
      answer: z.string(),
      category: z.string().optional(),
    }),
  },
} satisfies CatalogDefinitions;

export type BrillarCatalogDefinitions = typeof catalogDefinitions;
