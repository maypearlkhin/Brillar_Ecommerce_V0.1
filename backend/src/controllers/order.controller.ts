import { Response } from 'express';
import { CartService } from '../services/cart.service';
import { CheckoutService, OrderService } from '../services/order.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getParam } from '../utils/params';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await CartService.getCart(req.user!._id.toString());
    return sendSuccess(res, cart);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await CartService.addItem(
      req.user!._id.toString(),
      req.body.productId,
      req.body.quantity || 1
    );
    return sendSuccess(res, cart, 'Item added to cart');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await CartService.updateItem(
      req.user!._id.toString(),
      getParam(req.params.productId),
      req.body.quantity
    );
    return sendSuccess(res, cart, 'Cart updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await CartService.removeItem(
      req.user!._id.toString(),
      getParam(req.params.productId)
    );
    return sendSuccess(res, cart, 'Item removed');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    await CartService.clearCart(req.user!._id.toString());
    const cart = await CartService.getCart(req.user!._id.toString());
    return sendSuccess(res, cart, 'Cart cleared');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const checkout = async (req: AuthRequest, res: Response) => {
  try {
    const order = await CheckoutService.placeOrder(
      req.user!._id.toString(),
      req.body.deliveryAddress,
      req.body.paymentMethod
    );
    return sendSuccess(res, order, 'Order placed successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await OrderService.getCustomerOrders(
      req.user!._id.toString(),
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderService.getCustomerOrder(
      req.user!._id.toString(),
      getParam(req.params.id)
    );
    return sendSuccess(res, order);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const buyAgain = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await OrderService.buyAgain(req.user!._id.toString(), getParam(req.params.id));
    return sendSuccess(res, cart, 'Items added to cart');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};
