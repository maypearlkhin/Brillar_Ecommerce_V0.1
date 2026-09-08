import { z } from 'zod';
import type { CatalogDefinitions } from '@copilotkit/a2ui-renderer';

const productShape = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  imageUrl: z.string().optional(),
  inStock: z.boolean(),
  supplierName: z.string().optional(),
});

const cartItemShape = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
  imageUrl: z.string().optional(),
});

const faqShape = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
});

const orderLineShape = z.object({
  name: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
});

export const catalogDefinitions = {
  ProductList: {
    description:
      'SELF-CONTAINED product grid. Put every product in the products array prop with productId. ' +
      'Use ONE ProductList per surface — do NOT use Card, Column, Row, or children.',
    props: z.object({
      title: z.string().optional(),
      products: z.array(productShape).min(1),
    }),
  },
  ProductDetailCard: {
    description:
      'SELF-CONTAINED in-chat product detail view. Include productId, name, price, description, imageUrl, inStock, supplierName. ' +
      'User can tap View details / Add to cart via rendered buttons — no page navigation.',
    props: z.object({
      productId: z.string(),
      name: z.string(),
      price: z.number(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      inStock: z.boolean(),
      supplierName: z.string().optional(),
      sku: z.string().optional(),
      category: z.string().optional(),
    }),
  },
  CartSummary: {
    description:
      'SELF-CONTAINED interactive cart view. Each item MUST include productId for button actions. ' +
      'Use ONE CartSummary per surface — no layout primitives or children.',
    props: z.object({
      title: z.string().optional(),
      items: z.array(cartItemShape),
      subtotal: z.number(),
      itemCount: z.number(),
      showCheckout: z.boolean().optional(),
    }),
  },
  OrderStatusCard: {
    description:
      'SELF-CONTAINED order status card. Include orderId for view_order action. ' +
      'Use ONE OrderStatusCard per surface — no children.',
    props: z.object({
      orderId: z.string(),
      orderNumber: z.string(),
      status: z.string(),
      total: z.number(),
      createdAt: z.string(),
      itemSummary: z.string().optional(),
    }),
  },
  OrderDetailCard: {
    description:
      'SELF-CONTAINED order detail view with line items. Include orderId. No page links.',
    props: z.object({
      orderId: z.string(),
      orderNumber: z.string(),
      status: z.string(),
      total: z.number(),
      createdAt: z.string(),
      paymentMethod: z.string().optional(),
      deliveryAddress: z.string().optional(),
      items: z.array(orderLineShape).optional(),
    }),
  },
  CheckoutForm: {
    description:
      'INTERACTIVE checkout form — user fills delivery address and payment IN THE UI (not chat). ' +
      'Use when user clicks Checkout or asks to place an order. NEVER ask for address/payment in plain text. ' +
      'Optionally prefill defaultFullName, defaultPhone, defaultAddressLine1, defaultCity, defaultPostalCode from get_profile. ' +
      'Include subtotal and itemCount from get_cart when available.',
    props: z.object({
      title: z.string().optional(),
      subtotal: z.number().optional(),
      itemCount: z.number().optional(),
      defaultFullName: z.string().optional(),
      defaultPhone: z.string().optional(),
      defaultAddressLine1: z.string().optional(),
      defaultCity: z.string().optional(),
      defaultPostalCode: z.string().optional(),
      defaultPaymentMethod: z.string().optional(),
    }),
  },
  FaqList: {
    description:
      'SELF-CONTAINED FAQ list. Put every FAQ in the faqs array prop. ' +
      'Use ONE FaqList per surface — do NOT use separate FaqItem children.',
    props: z.object({
      title: z.string().optional(),
      faqs: z.array(faqShape).min(1),
    }),
  },
  FaqItem: {
    description:
      'Single FAQ card. Prefer FaqList when showing multiple FAQs. No children.',
    props: faqShape,
  },
  AuthLoginCard: {
    description:
      'SELF-CONTAINED sign-in form shown in the UI pane when the user must authenticate. ' +
      'Use for guests attempting cart, checkout, or order actions. No page navigation.',
    props: z.object({
      title: z.string().optional(),
      message: z.string().optional(),
    }),
  },
  AuthSignupCard: {
    description:
      'SELF-CONTAINED registration form shown in the UI pane for guest users. ' +
      'Use when the user needs an account before cart, checkout, or order actions.',
    props: z.object({
      title: z.string().optional(),
      message: z.string().optional(),
    }),
  },
} satisfies CatalogDefinitions;

export type BrillarCatalogDefinitions = typeof catalogDefinitions;

export type A2UIActionPayload = {
  event: {
    name: string;
    context?: Record<string, unknown>;
  };
};
