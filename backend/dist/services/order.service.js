"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = exports.CheckoutService = void 0;
const Order_1 = require("../models/Order");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const cart_service_1 = require("./cart.service");
const orderNumber_1 = require("../utils/orderNumber");
class CheckoutService {
    static async placeOrder(customerId, deliveryAddress, paymentMethod) {
        const cart = await Cart_1.Cart.findOne({ customerId });
        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty');
        }
        const supplierOrderMap = new Map();
        for (const cartItem of cart.items) {
            const product = await Product_1.Product.findById(cartItem.productId);
            if (!product || product.status !== 'active') {
                throw new Error(`Product "${product?.name || 'unknown'}" is no longer available`);
            }
            if (product.stockQuantity < cartItem.quantity) {
                throw new Error(`Insufficient stock for "${product.name}"`);
            }
            const supplierId = product.supplierId.toString();
            const lineTotal = product.price * cartItem.quantity;
            if (!supplierOrderMap.has(supplierId)) {
                supplierOrderMap.set(supplierId, {
                    supplierId,
                    items: [],
                    subtotal: 0,
                });
            }
            const supplierOrder = supplierOrderMap.get(supplierId);
            supplierOrder.items.push({
                productId: product._id.toString(),
                nameSnapshot: product.name,
                skuSnapshot: product.sku,
                unitPrice: product.price,
                unitCost: product.cost,
                quantity: cartItem.quantity,
                lineTotal,
            });
            supplierOrder.subtotal += lineTotal;
            product.stockQuantity -= cartItem.quantity;
            if (product.stockQuantity === 0) {
                product.status = 'out_of_stock';
            }
            await product.save();
        }
        const supplierOrders = Array.from(supplierOrderMap.values()).map((so) => ({
            supplierId: so.supplierId,
            items: so.items,
            subtotal: so.subtotal,
            fulfillmentStatus: 'pending',
        }));
        const subtotal = supplierOrders.reduce((sum, so) => sum + so.subtotal, 0);
        const order = await Order_1.Order.create({
            orderNumber: (0, orderNumber_1.generateOrderNumber)(),
            customerId,
            supplierOrders,
            deliveryAddress,
            paymentMethod,
            paymentStatus: 'paid',
            subtotal,
            total: subtotal,
            status: 'processing',
        });
        await cart_service_1.CartService.clearCart(customerId);
        return order.populate([
            { path: 'customerId', select: 'name email' },
            { path: 'supplierOrders.supplierId', select: 'storeName slug' },
        ]);
    }
}
exports.CheckoutService = CheckoutService;
class OrderService {
    static async getCustomerOrders(customerId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order_1.Order.find({ customerId })
                .populate('supplierOrders.supplierId', 'storeName slug')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order_1.Order.countDocuments({ customerId }),
        ]);
        return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    }
    static async getCustomerOrder(customerId, orderId) {
        const order = await Order_1.Order.findOne({ _id: orderId, customerId })
            .populate('supplierOrders.supplierId', 'storeName slug');
        if (!order)
            throw new Error('Order not found');
        return order;
    }
    static async buyAgain(customerId, orderId) {
        const order = await Order_1.Order.findOne({ _id: orderId, customerId });
        if (!order)
            throw new Error('Order not found');
        await cart_service_1.CartService.clearCart(customerId);
        for (const supplierOrder of order.supplierOrders) {
            for (const item of supplierOrder.items) {
                try {
                    await cart_service_1.CartService.addItem(customerId, item.productId.toString(), item.quantity);
                }
                catch {
                    // Skip unavailable items silently
                }
            }
        }
        return cart_service_1.CartService.getCart(customerId);
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map