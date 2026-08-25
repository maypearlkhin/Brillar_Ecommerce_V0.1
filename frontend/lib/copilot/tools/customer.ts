import { defineTool } from '@copilotkit/runtime/v2';
import { z } from 'zod';
import { backendFetch, requireAuthToken, toToolError } from './backendClient';

export function createCustomerTools(userToken?: string) {
  const getProfile = defineTool({
    name: 'get_profile',
    description: 'Get the logged-in customer profile.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch('/auth/me', { token });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getCart = defineTool({
    name: 'get_cart',
    description: 'Get the current shopping cart for the logged-in customer.',
    parameters: z.object({}),
    execute: async () => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch('/cart', { token });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const addToCart = defineTool({
    name: 'add_to_cart',
    description: 'Add a product to the cart. Confirm with the user before calling.',
    parameters: z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(99).default(1),
    }),
    execute: async ({ productId, quantity }) => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch('/cart', {
          token,
          method: 'POST',
          body: { productId, quantity },
        });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const updateCartItem = defineTool({
    name: 'update_cart_item',
    description: 'Update quantity for a cart line item. Confirm with the user before calling.',
    parameters: z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1).max(99),
    }),
    execute: async ({ productId, quantity }) => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch(`/cart/${productId}`, {
          token,
          method: 'PUT',
          body: { quantity },
        });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const removeFromCart = defineTool({
    name: 'remove_from_cart',
    description: 'Remove a product from the cart. Confirm with the user before calling.',
    parameters: z.object({
      productId: z.string().min(1),
    }),
    execute: async ({ productId }) => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch(`/cart/${productId}`, {
          token,
          method: 'DELETE',
        });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getOrderHistory = defineTool({
    name: 'get_order_history',
    description: 'Get order history for the logged-in customer.',
    parameters: z.object({
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(20).optional(),
    }),
    execute: async (params) => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch('/orders', { token, params });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const getOrderDetails = defineTool({
    name: 'get_order_details',
    description: 'Get details for a specific order by id.',
    parameters: z.object({
      orderId: z.string().min(1),
    }),
    execute: async ({ orderId }) => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch(`/orders/${orderId}`, { token });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  const buyAgain = defineTool({
    name: 'buy_again',
    description: 'Re-add items from a past order to the cart. Confirm with the user before calling.',
    parameters: z.object({
      orderId: z.string().min(1),
    }),
    execute: async ({ orderId }) => {
      try {
        const token = requireAuthToken(userToken);
        return await backendFetch(`/orders/${orderId}/buy-again`, {
          token,
          method: 'POST',
        });
      } catch (error) {
        return toToolError(error);
      }
    },
  });

  return [
    getProfile,
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    getOrderHistory,
    getOrderDetails,
    buyAgain,
  ];
}
