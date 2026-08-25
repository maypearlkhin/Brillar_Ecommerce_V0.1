import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { CheckoutService, OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getParam, getQuery } from '../utils/params';

const getUserId = (req: Request) => {
  const userId = getQuery(req.body?.userId) || getQuery(req.query.userId);
  if (!userId) {
    throw new Error('userId is required');
  }
  return userId;
};

const normalizeCheckoutItems = (body: Record<string, unknown>) => {
  if (Array.isArray(body.items)) {
    return body.items
      .filter(
        (item): item is { productId: string; quantity?: number } =>
          typeof item === 'object'
          && item !== null
          && typeof (item as { productId?: unknown }).productId === 'string'
      )
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
      }));
  }

  if (typeof body.productId === 'string') {
    return [{
      productId: body.productId,
      quantity: Number(body.quantity) || 1,
    }];
  }

  return [];
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getProducts({
      search: req.query.search as string,
      category: req.query.category as string,
      supplier: req.query.supplier as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      inStock: req.query.inStock === 'true',
      type: req.query.type as string,
      gender: req.query.gender as string,
      age: req.query.age ? Number(req.query.age) : undefined,
      sort: req.query.sort as string,
      ...(req.query.page ? { page: Number(req.query.page) } : {}),
      ...(req.query.limit ? { limit: Number(req.query.limit) } : {}),
    });
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const cart = await CartService.addItem(
      getUserId(req),
      req.body.productId,
      req.body.quantity || 1
    );
    return sendSuccess(res, cart, 'Item added to cart');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const cart = await CartService.updateItem(
      getUserId(req),
      getParam(req.params.productId),
      req.body.quantity
    );
    return sendSuccess(res, cart, 'Cart updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const cart = await CartService.removeItem(
      getUserId(req),
      getParam(req.params.productId)
    );
    return sendSuccess(res, cart, 'Item removed');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const items = normalizeCheckoutItems(req.body);

    if (items.length > 0) {
      await CartService.clearCart(userId);
      for (const item of items) {
        await CartService.addItem(userId, item.productId, item.quantity);
      }
    }

    const order = await CheckoutService.placeOrder(
      userId,
      req.body.deliveryAddress,
      req.body.paymentMethod
    );
    return sendSuccess(res, order, 'Order placed successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const result = await OrderService.getCustomerOrders(
      getUserId(req),
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await OrderService.getCustomerOrder(
      getUserId(req),
      getParam(req.params.id)
    );
    return sendSuccess(res, order);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};
