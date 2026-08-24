import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getParam, getQuery } from '../utils/params';

const getUserId = (req: Request) => {
  const userId = getQuery(req.body?.userId) || getQuery(req.query.userId);
  if (!userId) {
    throw new Error('userId is required');
  }
  return userId;
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
