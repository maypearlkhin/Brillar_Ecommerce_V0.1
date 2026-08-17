"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../config/db");
const models_1 = require("../models");
const slugify_1 = require("../utils/slugify");
const orderNumber_1 = require("../utils/orderNumber");
const hash = (pw) => bcryptjs_1.default.hash(pw, 12);
async function seed() {
    await (0, db_1.connectDB)();
    console.log('Seeding database...');
    // Admin
    const adminHash = await hash('admin123');
    const admin = await models_1.User.findOneAndUpdate({ email: 'admin@ecommerce.com' }, {
        name: 'Platform Administrator',
        email: 'admin@ecommerce.com',
        passwordHash: adminHash,
        role: 'admin',
        isActive: true,
    }, { upsert: true, new: true });
    // Categories
    const categoryData = [
        { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech accessories', displayOrder: 1 },
        { name: 'Home & Living', slug: 'home-living', description: 'Furniture, decor, and household essentials', displayOrder: 2 },
        { name: 'Office Supplies', slug: 'office-supplies', description: 'Workspace essentials and stationery', displayOrder: 3 },
        { name: 'Fashion & Accessories', slug: 'fashion-accessories', description: 'Clothing, bags, and personal accessories', displayOrder: 4 },
        { name: 'Health & Wellness', slug: 'health-wellness', description: 'Fitness, personal care, and wellness products', displayOrder: 5 },
    ];
    const categories = {};
    for (const cat of categoryData) {
        const doc = await models_1.Category.findOneAndUpdate({ slug: cat.slug }, { ...cat, isActive: true }, { upsert: true, new: true });
        categories[cat.slug] = { ...cat, _id: doc._id };
    }
    // Suppliers
    const supplierDefs = [
        {
            email: 'supplier1@ecommerce.com',
            password: 'supplier123',
            name: 'Marcus Rivera',
            storeName: 'Northstar Electronics',
            description: 'Premium electronics and tech accessories for modern professionals.',
        },
        {
            email: 'supplier2@ecommerce.com',
            password: 'supplier123',
            name: 'Elena Whitfield',
            storeName: 'Harbor Home',
            description: 'Curated home goods and living essentials with coastal-inspired design.',
        },
        {
            email: 'supplier3@ecommerce.com',
            password: 'supplier123',
            name: 'James Okonkwo',
            storeName: 'Vertex Office Supply',
            description: 'Professional office equipment and workspace organization solutions.',
        },
    ];
    const suppliers = [];
    const supplierCategoryMap = {
        'supplier1@ecommerce.com': 'electronics',
        'supplier2@ecommerce.com': 'home-living',
        'supplier3@ecommerce.com': 'office-supplies',
    };
    for (const def of supplierDefs) {
        const pwHash = await hash(def.password);
        const user = await models_1.User.findOneAndUpdate({ email: def.email }, { name: def.name, email: def.email, passwordHash: pwHash, role: 'supplier', isActive: true }, { upsert: true, new: true });
        const catSlug = supplierCategoryMap[def.email] || 'electronics';
        const linkedCategory = categories[catSlug];
        const profile = await models_1.SupplierProfile.findOneAndUpdate({ userId: user._id }, {
            userId: user._id,
            storeName: def.storeName,
            slug: (0, slugify_1.slugify)(def.storeName),
            description: def.description,
            contactEmail: def.email,
            contactPhone: '+1-555-0100',
            categoryIds: linkedCategory ? [linkedCategory._id] : [],
            verificationStatus: 'verified',
            status: 'active',
        }, { upsert: true, new: true });
        await models_1.SupplierApplication.findOneAndUpdate({ userId: user._id }, {
            userId: user._id,
            storeName: def.storeName,
            contactName: def.name,
            email: def.email,
            phone: '+1-555-0100',
            description: def.description,
            categories: [linkedCategory?.name || 'Electronics'],
            status: 'approved',
            submittedAt: new Date('2026-06-01'),
            reviewedAt: new Date('2026-06-02'),
            reviewedBy: admin._id,
        }, { upsert: true, new: true });
        suppliers.push({ user, profile });
    }
    // Remove legacy demo customers that cluttered the admin list
    const removedCustomerEmails = [
        'customer4@ecommerce.com', 'customer5@ecommerce.com', 'customer6@ecommerce.com',
        'customer7@ecommerce.com', 'customer8@ecommerce.com', 'customer9@ecommerce.com',
        'customer10@ecommerce.com',
    ];
    const removedUsers = await models_1.User.find({ email: { $in: removedCustomerEmails } }).select('_id');
    if (removedUsers.length > 0) {
        const removedIds = removedUsers.map((u) => u._id);
        await models_1.Order.deleteMany({ customerId: { $in: removedIds } });
        await models_1.User.deleteMany({ _id: { $in: removedIds } });
    }
    // Customers (only shoppers with orders in demo data)
    const customerDefs = [
        { email: 'customer1@ecommerce.com', password: 'customer123', name: 'Sarah Mitchell' },
        { email: 'customer2@ecommerce.com', password: 'customer123', name: 'David Chen' },
        { email: 'customer3@ecommerce.com', password: 'customer123', name: 'Amanda Foster' },
    ];
    const customers = [];
    for (const def of customerDefs) {
        const pwHash = await hash(def.password);
        const user = await models_1.User.findOneAndUpdate({ email: def.email }, { name: def.name, email: def.email, passwordHash: pwHash, role: 'customer', isActive: true }, { upsert: true, new: true });
        customers.push(user);
    }
    // Pending applications
    const pendingUsers = [
        { email: 'applicant1@example.com', name: 'Daniel Chen', storeName: 'Aurora Tech Supply' },
        { email: 'applicant2@example.com', name: 'Priya Sharma', storeName: 'GreenLeaf Organics' },
    ];
    for (const app of pendingUsers) {
        const pwHash = await hash('applicant123');
        const user = await models_1.User.findOneAndUpdate({ email: app.email }, { name: app.name, email: app.email, passwordHash: pwHash, role: 'customer', isActive: true }, { upsert: true, new: true });
        await models_1.SupplierApplication.findOneAndUpdate({ userId: user._id, status: 'pending' }, {
            userId: user._id,
            storeName: app.storeName,
            contactName: app.name,
            email: app.email,
            phone: '+1-555-0200',
            description: `We specialize in quality products for the ${app.storeName} market.`,
            categories: ['Electronics', 'Accessories'],
            status: 'pending',
            submittedAt: new Date('2026-08-10'),
        }, { upsert: true, new: true });
    }
    // Rejected application
    const rejectedUser = await models_1.User.findOneAndUpdate({ email: 'rejected@example.com' }, {
        name: 'Tom Bradley',
        email: 'rejected@example.com',
        passwordHash: await hash('rejected123'),
        role: 'customer',
        isActive: true,
    }, { upsert: true, new: true });
    await models_1.SupplierApplication.findOneAndUpdate({ userId: rejectedUser._id }, {
        userId: rejectedUser._id,
        storeName: 'Quick Deals Outlet',
        contactName: 'Tom Bradley',
        email: 'rejected@example.com',
        phone: '+1-555-0300',
        description: 'Discount retail products.',
        status: 'rejected',
        adminNote: 'Incomplete business documentation. Please resubmit with valid business registration.',
        submittedAt: new Date('2026-07-15'),
        reviewedAt: new Date('2026-07-18'),
        reviewedBy: admin._id,
    }, { upsert: true, new: true });
    // Products
    const productDefs = [
        // Northstar Electronics
        { supplier: 0, category: 'electronics', name: 'Wireless Mechanical Keyboard', sku: 'NE-KB-001', price: 89.99, cost: 42.00, stock: 45, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
        { supplier: 0, category: 'electronics', name: 'USB-C Hub 7-in-1', sku: 'NE-HUB-002', price: 49.99, cost: 22.00, stock: 80, image: '/images/products/usb-c-hub-7in1.jpg' },
        { supplier: 0, category: 'electronics', name: 'Noise-Cancelling Headphones', sku: 'NE-HP-003', price: 199.99, cost: 95.00, stock: 30, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
        { supplier: 0, category: 'electronics', name: 'Portable Bluetooth Speaker', sku: 'NE-SP-004', price: 69.99, cost: 32.00, stock: 55, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
        { supplier: 0, category: 'electronics', name: 'Wireless Mouse Pro', sku: 'NE-MS-005', price: 39.99, cost: 15.00, stock: 100, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
        { supplier: 0, category: 'electronics', name: '27" Monitor Stand', sku: 'NE-ST-006', price: 34.99, cost: 14.00, stock: 3, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' },
        { supplier: 0, category: 'electronics', name: 'Webcam HD 1080p', sku: 'NE-WC-007', price: 59.99, cost: 28.00, stock: 40, image: '/images/products/webcam-hd-1080p.jpg' },
        // Harbor Home
        { supplier: 1, category: 'home-living', name: 'Ceramic Table Lamp', sku: 'HH-LP-001', price: 54.99, cost: 22.00, stock: 25, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
        { supplier: 1, category: 'home-living', name: 'Linen Throw Pillow Set', sku: 'HH-PP-002', price: 39.99, cost: 16.00, stock: 60, image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400' },
        { supplier: 1, category: 'home-living', name: 'Bamboo Storage Basket', sku: 'HH-BS-003', price: 29.99, cost: 11.00, stock: 45, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
        { supplier: 1, category: 'home-living', name: 'Scented Candle Collection', sku: 'HH-CD-004', price: 24.99, cost: 8.00, stock: 90, image: '/images/products/scented-candle-collection.jpg' },
        { supplier: 1, category: 'home-living', name: 'Wall Mirror Round 24"', sku: 'HH-MR-005', price: 79.99, cost: 35.00, stock: 15, image: '/images/products/wall-mirror-round.jpg' },
        { supplier: 1, category: 'home-living', name: 'Cotton Bath Towel Set', sku: 'HH-TW-006', price: 44.99, cost: 18.00, stock: 70, image: '/images/products/cotton-bath-towel-set.jpg' },
        // Vertex Office Supply
        { supplier: 2, category: 'office-supplies', name: 'Ergonomic Office Chair', sku: 'VO-CH-001', price: 299.99, cost: 150.00, stock: 12, image: '/images/products/ergonomic-office-chair.jpg' },
        { supplier: 2, category: 'office-supplies', name: 'Standing Desk Converter', sku: 'VO-DS-002', price: 189.99, cost: 85.00, stock: 20, image: '/images/products/standing-desk-converter.jpg' },
        { supplier: 2, category: 'office-supplies', name: 'Premium Notebook Set (3-pack)', sku: 'VO-NB-003', price: 18.99, cost: 6.00, stock: 150, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400' },
        { supplier: 2, category: 'office-supplies', name: 'Desk Organizer Tray', sku: 'VO-OR-004', price: 22.99, cost: 8.00, stock: 85, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400' },
        { supplier: 2, category: 'office-supplies', name: 'LED Desk Lamp', sku: 'VO-DL-005', price: 45.99, cost: 19.00, stock: 50, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
        { supplier: 2, category: 'office-supplies', name: 'Cable Management Kit', sku: 'VO-CM-006', price: 14.99, cost: 4.50, stock: 200, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
        { supplier: 2, category: 'office-supplies', name: 'Whiteboard 36x24', sku: 'VO-WB-007', price: 34.99, cost: 14.00, stock: 35, image: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400' },
        // Cross-category
        { supplier: 0, category: 'fashion-accessories', name: 'Laptop Sleeve 15"', sku: 'NE-LS-008', price: 29.99, cost: 12.00, stock: 65, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
        { supplier: 1, category: 'health-wellness', name: 'Aromatherapy Diffuser', sku: 'HH-AD-007', price: 36.99, cost: 14.00, stock: 40, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400' },
        { supplier: 2, category: 'electronics', name: 'Document Scanner Portable', sku: 'VO-SC-008', price: 129.99, cost: 65.00, stock: 18, image: '/images/products/document-scanner.jpg' },
    ];
    const products = [];
    for (const p of productDefs) {
        const product = await models_1.Product.findOneAndUpdate({ sku: p.sku }, {
            supplierId: suppliers[p.supplier].profile._id,
            categoryId: categories[p.category]._id,
            name: p.name,
            slug: (0, slugify_1.slugify)(p.name),
            sku: p.sku,
            description: `High-quality ${p.name.toLowerCase()} from our marketplace. Designed for everyday use with attention to detail and durability.`,
            price: p.price,
            cost: p.cost,
            stockQuantity: p.stock,
            lowStockThreshold: 5,
            imageUrls: [p.image],
            status: p.stock === 0 ? 'out_of_stock' : 'active',
        }, { upsert: true, new: true });
        products.push(product);
    }
    // Orders
    const orderCount = await models_1.Order.countDocuments();
    if (orderCount === 0) {
        const orderDefs = [
            {
                customer: customers[0],
                items: [
                    { product: products[0], qty: 1 },
                    { product: products[7], qty: 2 },
                ],
                status: 'completed',
                fulfillment: ['delivered', 'delivered'],
            },
            {
                customer: customers[1],
                items: [
                    { product: products[2], qty: 1 },
                    { product: products[13], qty: 1 },
                ],
                status: 'processing',
                fulfillment: ['shipped', 'processing'],
            },
            {
                customer: customers[2],
                items: [
                    { product: products[14], qty: 1 },
                ],
                status: 'processing',
                fulfillment: ['confirmed'],
            },
            {
                customer: customers[0],
                items: [
                    { product: products[4], qty: 2 },
                    { product: products[16], qty: 3 },
                ],
                status: 'completed',
                fulfillment: ['delivered', 'delivered'],
            },
        ];
        for (const od of orderDefs) {
            const supplierOrderMap = new Map();
            od.items.forEach((item, idx) => {
                const sid = item.product.supplierId.toString();
                const lineTotal = item.product.price * item.qty;
                if (!supplierOrderMap.has(sid)) {
                    supplierOrderMap.set(sid, {
                        supplierId: item.product.supplierId,
                        items: [],
                        subtotal: 0,
                        fulfillmentStatus: od.fulfillment[idx] || 'pending',
                    });
                }
                const so = supplierOrderMap.get(sid);
                so.items.push({
                    productId: item.product._id,
                    nameSnapshot: item.product.name,
                    skuSnapshot: item.product.sku,
                    unitPrice: item.product.price,
                    unitCost: item.product.cost,
                    quantity: item.qty,
                    lineTotal,
                });
                so.subtotal += lineTotal;
                so.fulfillmentStatus = (od.fulfillment[idx] || 'pending');
            });
            const supplierOrders = Array.from(supplierOrderMap.values());
            const subtotal = supplierOrders.reduce((s, so) => s + so.subtotal, 0);
            await models_1.Order.create({
                orderNumber: (0, orderNumber_1.generateOrderNumber)(),
                customerId: od.customer._id,
                supplierOrders,
                deliveryAddress: {
                    fullName: od.customer.name,
                    phone: '+1-555-1000',
                    addressLine1: '742 Evergreen Terrace',
                    city: 'Springfield',
                    stateRegion: 'IL',
                    postalCode: '62704',
                },
                paymentMethod: 'demo_card',
                paymentStatus: 'paid',
                subtotal,
                total: subtotal,
                status: od.status,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });
        }
    }
    // FAQs
    const faqDefs = [
        { question: 'How does multi-supplier checkout work?', answer: 'When you purchase items from multiple sellers, we create a single order with separate fulfillment tracking for each supplier. You receive one confirmation, and each seller ships their items independently.', category: 'Orders', displayOrder: 1 },
        { question: 'What payment methods are accepted?', answer: 'We accept Cash on Delivery and Demo Card Payment for this marketplace. All payments are simulated for development purposes.', category: 'Payments', displayOrder: 2 },
        { question: 'How do I become a supplier?', answer: 'Click "Become a Supplier" in the navigation, create an account or log in, and submit your application. Our team reviews applications within 2-3 business days.', category: 'Suppliers', displayOrder: 3 },
        { question: 'What is your return policy?', answer: 'Returns are accepted within 14 days of delivery for unused items in original packaging. Contact the supplier directly through your order details to initiate a return.', category: 'Returns', displayOrder: 4 },
        { question: 'How can I track my order?', answer: 'Visit your Orders page to view order status and fulfillment updates from each supplier involved in your purchase.', category: 'Orders', displayOrder: 5 },
        { question: 'Is my personal information secure?', answer: 'Yes. We use industry-standard encryption and never share your personal data with suppliers beyond what is necessary for order fulfillment.', category: 'Account', displayOrder: 6 },
    ];
    for (const faq of faqDefs) {
        await models_1.FAQ.findOneAndUpdate({ question: faq.question }, { ...faq, isActive: true }, { upsert: true, new: true });
    }
    console.log('Seed completed successfully!');
    console.log('\nDemo Accounts:');
    console.log('  Admin:    admin@ecommerce.com / admin123');
    console.log('  Supplier: supplier1@ecommerce.com / supplier123');
    console.log('  Customer: customer1@ecommerce.com / customer123');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map