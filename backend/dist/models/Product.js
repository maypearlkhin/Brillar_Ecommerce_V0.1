"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const productAttributes_1 = require("../constants/productAttributes");
const productSchema = new mongoose_1.Schema({
    supplierId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SupplierProfile', required: true },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    brand: { type: String, trim: true },
    description: { type: String, required: true },
    productType: { type: String, enum: productAttributes_1.PRODUCT_TYPES },
    gender: { type: String, enum: productAttributes_1.PRODUCT_GENDERS },
    minAge: { type: Number, min: 0 },
    maxAge: { type: Number, min: 0 },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
    imageUrls: [{ type: String }],
    likeCount: { type: Number, required: true, min: 0, default: 0 },
    status: {
        type: String,
        enum: ['draft', 'active', 'out_of_stock', 'archived', 'inactive'],
        default: 'draft',
    },
}, { timestamps: true });
productSchema.index({ supplierId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ minAge: 1, maxAge: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ supplierId: 1, slug: 1 }, { unique: true });
exports.Product = mongoose_1.default.model('Product', productSchema);
//# sourceMappingURL=Product.js.map