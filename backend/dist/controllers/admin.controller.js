"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.deleteConfiguration = exports.createConfiguration = exports.getConfiguration = exports.deleteFAQ = exports.updateFAQ = exports.createFAQ = exports.getAllFAQs = exports.getPublicFAQs = exports.getOrder = exports.getOrders = exports.toggleCustomerStatus = exports.getCustomer = exports.getCustomers = exports.getDashboard = void 0;
const admin_service_1 = require("../services/admin.service");
const apiResponse_1 = require("../utils/apiResponse");
const params_1 = require("../utils/params");
const category_service_1 = require("../services/category.service");
const getDashboard = async (_req, res) => {
    try {
        const data = await admin_service_1.AdminDashboardService.getDashboard();
        return (0, apiResponse_1.sendSuccess)(res, data);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getDashboard = getDashboard;
const getCustomers = async (req, res) => {
    try {
        const result = await admin_service_1.AdminCustomerService.getCustomers(req.query.search, Number(req.query.page) || 1);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getCustomers = getCustomers;
const getCustomer = async (req, res) => {
    try {
        const data = await admin_service_1.AdminCustomerService.getCustomer((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, data);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.getCustomer = getCustomer;
const toggleCustomerStatus = async (req, res) => {
    try {
        const result = await admin_service_1.AdminCustomerService.toggleCustomerStatus((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, result, 'Customer status updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.toggleCustomerStatus = toggleCustomerStatus;
const getOrders = async (req, res) => {
    try {
        const result = await admin_service_1.AdminOrderService.getOrders(Number(req.query.page) || 1, Number(req.query.limit) || 20, req.query.status);
        return (0, apiResponse_1.sendSuccess)(res, result);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getOrders = getOrders;
const getOrder = async (req, res) => {
    try {
        const order = await admin_service_1.AdminOrderService.getOrder((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, order);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.getOrder = getOrder;
const getPublicFAQs = async (req, res) => {
    try {
        const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
        const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
        const faqs = await admin_service_1.FAQService.getPublicFAQs({ page, limit });
        return (0, apiResponse_1.sendSuccess)(res, faqs);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getPublicFAQs = getPublicFAQs;
const getAllFAQs = async (req, res) => {
    try {
        const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
        const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
        const faqs = await admin_service_1.FAQService.getAllFAQs({ page, limit });
        return (0, apiResponse_1.sendSuccess)(res, faqs);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getAllFAQs = getAllFAQs;
const createFAQ = async (req, res) => {
    try {
        const faq = await admin_service_1.FAQService.createFAQ(req.body);
        return (0, apiResponse_1.sendSuccess)(res, faq, 'FAQ created', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.createFAQ = createFAQ;
const updateFAQ = async (req, res) => {
    try {
        const faq = await admin_service_1.FAQService.updateFAQ((0, params_1.getParam)(req.params.id), req.body);
        return (0, apiResponse_1.sendSuccess)(res, faq, 'FAQ updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateFAQ = updateFAQ;
const deleteFAQ = async (req, res) => {
    try {
        await admin_service_1.FAQService.deleteFAQ((0, params_1.getParam)(req.params.id));
        return (0, apiResponse_1.sendSuccess)(res, null, 'FAQ deleted');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.deleteFAQ = deleteFAQ;
const getConfiguration = async (_req, res) => {
    try {
        const data = await admin_service_1.ConfigurationService.getAll();
        return (0, apiResponse_1.sendSuccess)(res, data);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getConfiguration = getConfiguration;
const createConfiguration = async (req, res) => {
    try {
        const { type, url, token } = req.body;
        const config = await admin_service_1.ConfigurationService.create(type, { url, token });
        return (0, apiResponse_1.sendSuccess)(res, config, 'Configuration saved', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.createConfiguration = createConfiguration;
const deleteConfiguration = async (req, res) => {
    try {
        await admin_service_1.ConfigurationService.remove((0, params_1.getParam)(req.params.type));
        return (0, apiResponse_1.sendSuccess)(res, null, 'Configuration removed');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.deleteConfiguration = deleteConfiguration;
const createCategory = async (req, res) => {
    try {
        const category = await (0, category_service_1.findOrCreateCategory)(req.body.name);
        return (0, apiResponse_1.sendSuccess)(res, category, 'Category saved', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.createCategory = createCategory;
//# sourceMappingURL=admin.controller.js.map