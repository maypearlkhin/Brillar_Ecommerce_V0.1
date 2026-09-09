const GENERATE_A2UI_TOOL_NAME = 'generate_a2ui';

export type GenerateA2uiArgs = {
  surfaceId: string;
  components: Array<Record<string, unknown>>;
};

const MAX_PRODUCTS = 12;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function mapProduct(raw: unknown): Record<string, unknown> | null {
  const product = asRecord(raw);
  if (!product) return null;

  const productId = pickString(product.productId, product._id, product.id);
  const name = pickString(product.name);
  const price = pickNumber(product.price);
  if (!productId || !name || price === undefined) return null;

  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];
  const supplier = asRecord(product.supplierId);
  const stock = pickNumber(product.stockQuantity);
  const inStock =
    typeof product.inStock === 'boolean' ? product.inStock : stock === undefined ? true : stock > 0;

  return {
    productId,
    name,
    price,
    imageUrl: pickString(product.imageUrl, imageUrls[0]),
    inStock,
    supplierName: pickString(product.supplierName, supplier?.storeName, supplier?.name),
  };
}

function extractProducts(output: unknown): Record<string, unknown>[] {
  if (Array.isArray(output)) {
    return output.map(mapProduct).filter((item): item is Record<string, unknown> => Boolean(item));
  }

  const record = asRecord(output);
  if (!record) return [];

  if (Array.isArray(record.products)) {
    return record.products
      .map(mapProduct)
      .filter((item): item is Record<string, unknown> => Boolean(item));
  }

  if (Array.isArray(record.featured)) {
    return record.featured
      .map(mapProduct)
      .filter((item): item is Record<string, unknown> => Boolean(item));
  }

  const single = mapProduct(record);
  return single ? [single] : [];
}

function mapCartItem(raw: unknown): Record<string, unknown> | null {
  const item = asRecord(raw);
  if (!item) return null;

  const nestedProduct = asRecord(item.productId);
  const productId = pickString(
    nestedProduct?._id,
    nestedProduct?.id,
    nestedProduct?.productId,
    typeof item.productId === 'string' ? item.productId : undefined,
    item._id,
  );
  const name = pickString(item.name, nestedProduct?.name);
  const quantity = pickNumber(item.quantity) ?? 1;
  const unitPrice = pickNumber(item.unitPrice, nestedProduct?.price);
  if (!productId || !name || unitPrice === undefined) return null;

  const imageUrls = Array.isArray(nestedProduct?.imageUrls)
    ? nestedProduct.imageUrls
    : Array.isArray(item.imageUrls)
      ? item.imageUrls
      : [];

  return {
    productId,
    name,
    quantity,
    unitPrice,
    lineTotal: pickNumber(item.lineTotal) ?? quantity * unitPrice,
    imageUrl: pickString(item.imageUrl, imageUrls[0]),
  };
}

function extractCart(output: unknown): {
  items: Record<string, unknown>[];
  subtotal: number;
  itemCount: number;
} | null {
  const record = asRecord(output);
  const itemsRaw = Array.isArray(output) ? output : record?.items;
  if (!Array.isArray(itemsRaw)) return null;

  const items = itemsRaw
    .map(mapCartItem)
    .filter((item): item is Record<string, unknown> => Boolean(item));

  const itemCount =
    pickNumber(record?.itemCount) ?? items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
  const subtotal =
    pickNumber(record?.subtotal, record?.total) ??
    items.reduce((sum, item) => sum + Number(item.lineTotal ?? 0), 0);

  return { items, subtotal, itemCount };
}

function mapFaq(raw: unknown): Record<string, unknown> | null {
  const faq = asRecord(raw);
  if (!faq) return null;
  const question = pickString(faq.question);
  const answer = pickString(faq.answer);
  if (!question || !answer) return null;
  return {
    question,
    answer,
    category: pickString(faq.category),
  };
}

function mapOrder(raw: unknown): Record<string, unknown> | null {
  const order = asRecord(raw);
  if (!order) return null;

  const orderId = pickString(order.orderId, order._id, order.id);
  const orderNumber = pickString(order.orderNumber, order.number, orderId);
  const status = pickString(order.status);
  const total = pickNumber(order.total, order.grandTotal, order.amount);
  const createdAt = pickString(order.createdAt, order.created_at);
  if (!orderId || !orderNumber || !status || total === undefined || !createdAt) return null;

  const itemsRaw = Array.isArray(order.items) ? order.items : [];
  const items = itemsRaw
    .map((line) => {
      const item = asRecord(line);
      if (!item) return null;
      const name = pickString(item.name, asRecord(item.productId)?.name);
      const quantity = pickNumber(item.quantity) ?? 1;
      const unitPrice = pickNumber(item.unitPrice, item.price);
      if (!name || unitPrice === undefined) return null;
      return {
        name,
        quantity,
        unitPrice,
        lineTotal: pickNumber(item.lineTotal) ?? quantity * unitPrice,
      };
    })
    .filter((item): item is Record<string, unknown> => Boolean(item));

  return {
    orderId,
    orderNumber,
    status,
    total,
    createdAt,
    paymentMethod: pickString(order.paymentMethod),
    deliveryAddress: pickString(order.deliveryAddress, asRecord(order.deliveryAddress)?.line1),
    itemSummary: pickString(order.itemSummary),
    items,
  };
}

function productList(surfaceId: string, title: string, products: Record<string, unknown>[]): GenerateA2uiArgs | null {
  if (products.length === 0) return null;
  return {
    surfaceId,
    components: [
      {
        id: 'root',
        component: 'ProductList',
        title,
        products: products.slice(0, MAX_PRODUCTS),
      },
    ],
  };
}

function isAuthError(output: unknown): boolean {
  const record = asRecord(output);
  return record?.requiresLogin === true;
}

/**
 * Build a complete generate_a2ui payload from an OpenAPI tool result.
 * Returns null when this result should not paint a catalog surface.
 */
export function buildA2uiFromToolResult(toolName: string, output: unknown): GenerateA2uiArgs | null {
  if (isAuthError(output)) {
    return {
      surfaceId: 'auth-login',
      components: [
        {
          id: 'root',
          component: 'AuthLoginCard',
          title: 'Sign in to continue',
          message: pickString(asRecord(output)?.error) ?? 'Please sign in to use this feature.',
        },
      ],
    };
  }

  switch (toolName) {
    case 'search_products':
      return productList('product-search', 'Products', extractProducts(output));
    case 'get_featured_products':
      return productList('featured-products', 'Featured products', extractProducts(output));
    case 'get_homepage':
      return productList('featured-products', 'Featured products', extractProducts(output));
    case 'get_product_details': {
      const product = mapProduct(output);
      if (!product) return null;
      const raw = asRecord(output);
      const category = asRecord(raw?.categoryId);
      return {
        surfaceId: 'product-detail',
        components: [
          {
            id: 'root',
            component: 'ProductDetailCard',
            ...product,
            description: pickString(raw?.description),
            sku: pickString(raw?.sku),
            category: pickString(raw?.category, category?.name),
          },
        ],
      };
    }
    case 'get_cart':
    case 'add_to_cart':
    case 'update_cart_item':
    case 'remove_from_cart':
    case 'buy_again': {
      const cart = extractCart(output);
      if (!cart) return null;
      return {
        surfaceId: 'cart-view',
        components: [
          {
            id: 'root',
            component: 'CartSummary',
            title: 'Your shopping cart',
            items: cart.items,
            subtotal: cart.subtotal,
            itemCount: cart.itemCount,
            showCheckout: cart.itemCount > 0,
          },
        ],
      };
    }
    case 'checkout': {
      const order = mapOrder(output);
      if (!order) return null;
      return {
        surfaceId: 'order-status',
        components: [{ id: 'root', component: 'OrderStatusCard', ...order }],
      };
    }
    case 'get_order_details': {
      const order = mapOrder(output);
      if (!order) return null;
      return {
        surfaceId: 'order-detail',
        components: [{ id: 'root', component: 'OrderDetailCard', ...order }],
      };
    }
    case 'get_order_history': {
      const orders = Array.isArray(output)
        ? output
        : Array.isArray(asRecord(output)?.orders)
          ? (asRecord(output)?.orders as unknown[])
          : [];
      const first = mapOrder(orders[0]);
      if (!first) return null;
      return {
        surfaceId: 'order-status',
        components: [{ id: 'root', component: 'OrderStatusCard', ...first }],
      };
    }
    case 'get_faqs': {
      const faqsRaw = Array.isArray(output)
        ? output
        : Array.isArray(asRecord(output)?.faqs)
          ? (asRecord(output)?.faqs as unknown[])
          : [];
      const faqs = faqsRaw
        .map(mapFaq)
        .filter((item): item is Record<string, unknown> => Boolean(item));
      if (faqs.length === 0) return null;
      return {
        surfaceId: 'faqs',
        components: [{ id: 'root', component: 'FaqList', title: 'FAQs', faqs }],
      };
    }
    default:
      return null;
  }
}

export function canBuildA2uiFromToolResult(toolName: string, output: unknown): boolean {
  return buildA2uiFromToolResult(toolName, output) !== null;
}

export function createGenerateA2uiStreamParts(args: GenerateA2uiArgs): Array<{
  type: string;
  id?: string;
  toolCallId?: string;
  toolName: string;
  input?: GenerateA2uiArgs;
}> {
  const toolCallId = `call_a2ui_${crypto.randomUUID().replace(/-/g, '').slice(0, 22)}`;
  return [
    {
      type: 'tool-input-start',
      id: toolCallId,
      toolName: GENERATE_A2UI_TOOL_NAME,
    },
    {
      type: 'tool-call',
      toolCallId,
      toolName: GENERATE_A2UI_TOOL_NAME,
      input: args,
    },
  ];
}
