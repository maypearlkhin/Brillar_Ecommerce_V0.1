"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyAgain = exports.getOrder = exports.getOrders = exports.checkout = exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const cart_service_1 = require("../services/cart.service");
const order_service_1 = require("../services/order.service");
const apiResponse_1 = require("../utils/apiResponse");
const params_1 = require("../utils/params");
const getCart = async (req, res) => {
    try {
        const cart = await cart_service_1.CartService.getCart(req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, cart);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getCart = getCart;
const addToCart = async (req, res) => {
    try {
        const cart = await cart_service_1.CartService.addItem(req.user._id.toString(), req.body.productId, req.body.quantity || 1);
        return (0, apiResponse_1.sendSuccess)(res, cart, 'Item added to cart');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.addToCart = addToCart;
const updateCartItem = async (req, res) => {
    try {
        const cart = await cart_service_1.CartService.updateItem(req.user._id.toString(), (0, params_1.getParam)(req.params.productId), req.body.quantity);
        return (0, apiResponse_1.sendSuccess)(res, cart, 'Cart updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateCartItem = updateCartItem;
const removeCartItem = async (req, res) => {
    try {
        const cart = await cart_service_1.CartService.removeItem(req.user._id.toString(), (0, params_1.getParam)(req.params.productId));
        return (0, apiResponse_1.sendSuccess)(res, cart, 'Item removed');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.removeCartItem = removeCartItem;
const clearCart = async (req, res) => {
    try {
        await cart_service_1.CartService.clearCart(req.user._id.toString());
        const cart = await cart_service_1.CartService.getCart(req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, cart, 'Cart cleared');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.clearCart = clearCart;
const checkout = async (req, res) => {
    try {
        const order = await order_service_1.CheckoutService.placeOrder(req.user._id.toString(), req.body.deliveryAddress, req.body.paymentMethod);
        return (0, apiResponse_1.sendSuccess)(res, order, 'Order placed successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.checkout = checkout;
const getOrders = async (req, res) => {
    try {
        const result = await order_service_1.OrderService.getCustomerOrders(req.user._id.toString(), Number(req.query.page) || 1, Number(req.query.limit) || 10);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res) => {
    try {
        const order = await order_service_1.OrderService.getCustomerOrder(req.user._id.toString(), (0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, order);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.getOrder = getOrder;
const buyAgain = async (req, res) => {
    try {
        const cart = await order_service_1.OrderService.buyAgain(req.user._id.toString(), (0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, cart, 'Items added to cart');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.buyAgain = buyAgain;
//# sourceMappingURL=order.controller.js.map