"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCreateSupplier = exports.adminReactivateSupplier = exports.adminSuspendSupplier = exports.adminGetSuppliers = exports.adminRequestMoreInfo = exports.adminRejectApplication = exports.adminApproveApplication = exports.adminGetApplication = exports.adminGetApplications = exports.uploadProductImages = exports.updateStock = exports.archiveProduct = exports.getSupplierCategories = exports.getInventory = exports.getFinancials = exports.getEarnings = exports.updateFulfillment = exports.getOrders = exports.updateProduct = exports.createProduct = exports.getProducts = exports.updateProfile = exports.getProfile = exports.getDashboard = exports.getMyApplication = exports.submitApplication = void 0;
const supplier_service_1 = require("../services/supplier.service");
const apiResponse_1 = require("../utils/apiResponse");
const params_1 = require("../utils/params");
const submitApplication = async (req, res) => {
    try {
        const app = await supplier_service_1.SupplierApplicationService.submit(req.user._id.toString(), req.body);
        return (0, apiResponse_1.sendSuccess)(res, app, 'Application submitted', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.submitApplication = submitApplication;
const getMyApplication = async (req, res) => {
    try {
        const app = await supplier_service_1.SupplierApplicationService.getMyApplication(req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, app);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getMyApplication = getMyApplication;
const getDashboard = async (req, res) => {
    try {
        const data = await supplier_service_1.SupplierService.getDashboard(req.auth.supplierProfileId);
        return (0, apiResponse_1.sendSuccess)(res, data);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getDashboard = getDashboard;
const getProfile = async (req, res) => {
    try {
        const profile = await supplier_service_1.SupplierService.getProfile(req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, profile);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const profile = await supplier_service_1.SupplierService.updateProfile(req.user._id.toString(), req.body);
        return (0, apiResponse_1.sendSuccess)(res, profile, 'Profile updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateProfile = updateProfile;
const getProducts = async (req, res) => {
    try {
        const result = await supplier_service_1.SupplierService.getProducts(req.auth.supplierProfileId, Number(req.query.page) || 1, Number(req.query.limit) || 20, req.query.search, req.query.status);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getProducts = getProducts;
const createProduct = async (req, res) => {
    try {
        const product = await supplier_service_1.SupplierService.createProduct(req.auth.supplierProfileId, req.body);
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product created', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const product = await supplier_service_1.SupplierService.updateProduct(req.auth.supplierProfileId, (0, params_1.getParam)(req.params.id), req.body);
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateProduct = updateProduct;
const getOrders = async (req, res) => {
    try {
        const result = await supplier_service_1.SupplierService.getOrders(req.auth.supplierProfileId, Number(req.query.page) || 1, Number(req.query.limit) || 10);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getOrders = getOrders;
const updateFulfillment = async (req, res) => {
    try {
        const order = await supplier_service_1.SupplierService.updateFulfillment(req.auth.supplierProfileId, (0, params_1.getParam)(req.params.id), req.body.fulfillmentStatus);
        return (0, apiResponse_1.sendSuccess)(res, order, 'Fulfillment status updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateFulfillment = updateFulfillment;
const getEarnings = async (req, res) => {
    try {
        const earnings = await supplier_service_1.SupplierService.getEarnings(req.auth.supplierProfileId);
        return (0, apiResponse_1.sendSuccess)(res, earnings);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getEarnings = getEarnings;
const getFinancials = async (req, res) => {
    try {
        const financials = await supplier_service_1.SupplierService.getEarnings(req.auth.supplierProfileId);
        return (0, apiResponse_1.sendSuccess)(res, financials);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getFinancials = getFinancials;
const getInventory = async (req, res) => {
    try {
        const result = await supplier_service_1.SupplierService.getInventory(req.auth.supplierProfileId, Number(req.query.page) || 1, Number(req.query.limit) || 50);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getInventory = getInventory;
const getSupplierCategories = async (req, res) => {
    try {
        const categories = await supplier_service_1.SupplierService.getCategories(req.auth.supplierProfileId);
        return (0, apiResponse_1.sendSuccess)(res, categories);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getSupplierCategories = getSupplierCategories;
const archiveProduct = async (req, res) => {
    try {
        const product = await supplier_service_1.SupplierService.archiveProduct(req.auth.supplierProfileId, (0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, product, 'Product archived');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.archiveProduct = archiveProduct;
const updateStock = async (req, res) => {
    try {
        const product = await supplier_service_1.SupplierService.updateStock(req.auth.supplierProfileId, (0, params_1.getParam)(req.params.id), Number(req.body.stockQuantity));
        return (0, apiResponse_1.sendSuccess)(res, product, 'Stock updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateStock = updateStock;
const uploadProductImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files?.length)
            return (0, apiResponse_1.sendError)(res, 'No images uploaded', 400);
        const port = process.env.PORT || '5000';
        const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${port}`;
        const urls = files.map((file) => `${baseUrl}/uploads/products/${file.filename}`);
        return (0, apiResponse_1.sendSuccess)(res, { urls }, 'Images uploaded');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.uploadProductImages = uploadProductImages;
// Admin supplier controllers
const adminGetApplications = async (req, res) => {
    try {
        const result = await supplier_service_1.AdminSupplierService.getApplications(req.query.status, Number(req.query.page) || 1);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.adminGetApplications = adminGetApplications;
const adminGetApplication = async (req, res) => {
    try {
        const app = await supplier_service_1.AdminSupplierService.getApplication((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, app);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.adminGetApplication = adminGetApplication;
const adminApproveApplication = async (req, res) => {
    try {
        const app = await supplier_service_1.AdminSupplierService.approveApplication((0, params_1.getParam)(req.params.id), req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, app, 'Application approved');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.adminApproveApplication = adminApproveApplication;
const adminRejectApplication = async (req, res) => {
    try {
        const app = await supplier_service_1.AdminSupplierService.rejectApplication((0, params_1.getParam)(req.params.id), req.user._id.toString(), req.body.adminNote);
        return (0, apiResponse_1.sendSuccess)(res, app, 'Application rejected');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.adminRejectApplication = adminRejectApplication;
const adminRequestMoreInfo = async (req, res) => {
    try {
        const app = await supplier_service_1.AdminSupplierService.requestMoreInfo((0, params_1.getParam)(req.params.id), req.user._id.toString(), req.body.adminNote);
        return (0, apiResponse_1.sendSuccess)(res, app, 'More information requested');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.adminRequestMoreInfo = adminRequestMoreInfo;
const adminGetSuppliers = async (req, res) => {
    try {
        const result = await supplier_service_1.AdminSupplierService.getSuppliers(req.query.status, Number(req.query.page) || 1);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.adminGetSuppliers = adminGetSuppliers;
const adminSuspendSupplier = async (req, res) => {
    try {
        const profile = await supplier_service_1.AdminSupplierService.suspendSupplier((0, params_1.getParam)(req.params.id), req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, profile, 'Supplier suspended');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.adminSuspendSupplier = adminSuspendSupplier;
const adminReactivateSupplier = async (req, res) => {
    try {
        const profile = await supplier_service_1.AdminSupplierService.reactivateSupplier((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, profile, 'Supplier reactivated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.adminReactivateSupplier = adminReactivateSupplier;
const adminCreateSupplier = async (req, res) => {
    try {
        const result = await supplier_service_1.AdminSupplierService.createSupplierManually(req.body);
        return (0, apiResponse_1.sendSuccess)(res, result, 'Supplier created', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.adminCreateSupplier = adminCreateSupplier;
//# sourceMappingURL=supplier.controller.js.map