"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuppliers = exports.getCategories = exports.getFeatured = exports.getProduct = exports.getProducts = void 0;
const Category_1 = require("../models/Category");
const product_service_1 = require("../services/product.service");
const SupplierProfile_1 = require("../models/SupplierProfile");
const apiResponse_1 = require("../utils/apiResponse");
const params_1 = require("../utils/params");
const getProducts = async (req, res) => {
    try {
        const result = await product_service_1.ProductService.getProducts({
            search: req.query.search,
            category: req.query.category,
            supplier: req.query.supplier,
            minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
            inStock: req.query.inStock === 'true',
            sort: req.query.sort,
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 12,
        });
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const product = await product_service_1.ProductService.getProductById((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, product);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.getProduct = getProduct;
const getFeatured = async (_req, res) => {
    try {
        const products = await product_service_1.ProductService.getFeatured();
        return (0, apiResponse_1.sendSuccess)(res, products);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getFeatured = getFeatured;
const getCategories = async (_req, res) => {
    try {
        const categories = await Category_1.Category.find({ isActive: true }).sort({ displayOrder: 1 });
        const withCounts = await Promise.all(categories.map(async (cat) => ({
            ...cat.toObject(),
            productCount: await product_service_1.ProductService.countPublicActive(cat._id.toString()),
        })));
        return (0, apiResponse_1.sendSuccess)(res, withCounts);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getCategories = getCategories;
const getSuppliers = async (_req, res) => {
    try {
        const suppliers = await SupplierProfile_1.SupplierProfile.find({ status: 'active' }).select('storeName slug description');
        return (0, apiResponse_1.sendSuccess)(res, suppliers);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getSuppliers = getSuppliers;
//# sourceMappingURL=product.controller.js.map