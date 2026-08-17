"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const SupplierProfile_1 = require("../models/SupplierProfile");
class CartService {
    static async getCart(customerId) {
        let cart = await Cart_1.Cart.findOne({ customerId }).populate({
            path: 'items.productId',
            select: 'name slug imageUrls status stockQuantity',
        }).populate({
            path: 'items.supplierId',
            select: 'storeName slug',
        });
        if (!cart) {
            cart = await Cart_1.Cart.create({ customerId, items: [] });
        }
        return cart;
    }
    static async addItem(customerId, productId, quantity) {
        const product = await Product_1.Product.findById(productId);
        if (!product || product.status !== 'active') {
            throw new Error('Product not available');
        }
        if (product.stockQuantity < quantity) {
            throw new Error('Insufficient stock');
        }
        const supplier = await SupplierProfile_1.SupplierProfile.findById(product.supplierId);
        if (!supplier || supplier.status !== 'active') {
            throw new Error('Supplier not available');
        }
        let cart = await Cart_1.Cart.findOne({ customerId });
        if (!cart) {
            cart = await Cart_1.Cart.create({ customerId, items: [] });
        }
        const existingIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
        if (existingIndex >= 0) {
            const newQty = cart.items[existingIndex].quantity + quantity;
            if (newQty > product.stockQuantity) {
                throw new Error('Insufficient stock');
            }
            cart.items[existingIndex].quantity = newQty;
            cart.items[existingIndex].unitPrice = product.price;
        }
        else {
            cart.items.push({
                productId: product._id,
                supplierId: product.supplierId,
                quantity,
                unitPrice: product.price,
            });
        }
        await cart.save();
        return this.getCart(customerId);
    }
    static async updateItem(customerId, productId, quantity) {
        const cart = await Cart_1.Cart.findOne({ customerId });
        if (!cart)
            throw new Error('Cart not found');
        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
        if (itemIndex < 0)
            throw new Error('Item not in cart');
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            const product = await Product_1.Product.findById(productId);
            if (!product || product.stockQuantity < quantity) {
                throw new Error('Insufficient stock');
            }
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].unitPrice = product.price;
        }
        await cart.save();
        return this.getCart(customerId);
    }
    static async removeItem(customerId, productId) {
        const cart = await Cart_1.Cart.findOne({ customerId });
        if (!cart)
            throw new Error('Cart not found');
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        await cart.save();
        return this.getCart(customerId);
    }
    static async clearCart(customerId) {
        await Cart_1.Cart.findOneAndUpdate({ customerId }, { $set: { items: [] } }, { new: true });
    }
}
exports.CartService = CartService;
//# sourceMappingURL=cart.service.js.map