import { Order, IDeliveryAddress, FulfillmentStatus, IOrder } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { CartService } from './cart.service';
import { generateOrderNumber } from '../utils/orderNumber';
import { syncOrderStatusFromFulfillment, deriveCustomerOrderStatus } from '../utils/orderStatus';

export class CheckoutService {
  static async placeOrder(
    customerId: string,
    deliveryAddress: IDeliveryAddress,
    paymentMethod: string
  ) {
    const cart = await Cart.findOne({ customerId });
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const supplierOrderMap = new Map<
      string,
      {
        supplierId: string;
        items: Array<{
          productId: string;
          nameSnapshot: string;
          skuSnapshot: string;
          unitPrice: number;
          unitCost: number;
          quantity: number;
          lineTotal: number;
        }>;
        subtotal: number;
      }
    >();

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
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

      const supplierOrder = supplierOrderMap.get(supplierId)!;
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
      fulfillmentStatus: 'pending' as FulfillmentStatus,
    }));

    const subtotal = supplierOrders.reduce((sum, so) => sum + so.subtotal, 0);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customerId,
      supplierOrders,
      deliveryAddress,
      paymentMethod,
      paymentStatus: 'paid',
      subtotal,
      total: subtotal,
      status: 'pending',
    });

    syncOrderStatusFromFulfillment(order);
    await order.save();

    await CartService.clearCart(customerId);

    return order.populate([
      { path: 'customerId', select: 'name email' },
      { path: 'supplierOrders.supplierId', select: 'storeName slug' },
    ]);
  }
}

export class OrderService {
  static formatCustomerOrder(order: IOrder) {
    const plain = order.toObject();
    return {
      ...plain,
      displayStatus: deriveCustomerOrderStatus(order),
    };
  }

  static async getCustomerOrders(customerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ customerId })
        .populate('supplierOrders.supplierId', 'storeName slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ customerId }),
    ]);
    return {
      orders: orders.map((order) => this.formatCustomerOrder(order)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  static async getCustomerOrder(customerId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, customerId })
      .populate('supplierOrders.supplierId', 'storeName slug');
    if (!order) throw new Error('Order not found');
    return this.formatCustomerOrder(order);
  }

  static async buyAgain(customerId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, customerId });
    if (!order) throw new Error('Order not found');

    await CartService.clearCart(customerId);

    for (const supplierOrder of order.supplierOrders) {
      for (const item of supplierOrder.items) {
        try {
          await CartService.addItem(customerId, item.productId.toString(), item.quantity);
        } catch {
          // Skip unavailable items silently
        }
      }
    }
    return CartService.getCart(customerId);
  }
}
