import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { SupplierProfile } from '../models/SupplierProfile';

export class CartService {
  static async getCart(customerId: string) {
    let cart = await Cart.findOne({ customerId }).populate({
      path: 'items.productId',
      select: 'name slug imageUrls status stockQuantity',
    }).populate({
      path: 'items.supplierId',
      select: 'storeName slug',
    });

    if (!cart) {
      cart = await Cart.create({ customerId, items: [] });
    }
    return cart;
  }

  static async addItem(customerId: string, productId: string, quantity: number) {
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      throw new Error('Product not available');
    }
    if (product.stockQuantity < quantity) {
      throw new Error('Insufficient stock');
    }

    const supplier = await SupplierProfile.findById(product.supplierId);
    if (!supplier || supplier.status !== 'active') {
      throw new Error('Supplier not available');
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = await Cart.create({ customerId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingIndex >= 0) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stockQuantity) {
        throw new Error('Insufficient stock');
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].unitPrice = product.price;
    } else {
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

  static async updateItem(customerId: string, productId: string, quantity: number) {
    const cart = await Cart.findOne({ customerId });
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex < 0) throw new Error('Item not in cart');

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product || product.stockQuantity < quantity) {
        throw new Error('Insufficient stock');
      }
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].unitPrice = product.price;
    }

    await cart.save();
    return this.getCart(customerId);
  }

  static async removeItem(customerId: string, productId: string) {
    const cart = await Cart.findOne({ customerId });
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    return this.getCart(customerId);
  }

  static async clearCart(customerId: string) {
    await Cart.findOneAndUpdate(
      { customerId },
      { $set: { items: [] } },
      { new: true }
    );
  }
}
