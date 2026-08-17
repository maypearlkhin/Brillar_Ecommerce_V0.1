"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveSupplier = exports.authorizeRoles = exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const SupplierProfile_1 = require("../models/SupplierProfile");
const apiResponse_1 = require("../utils/apiResponse");
const authenticate = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            return (0, apiResponse_1.sendError)(res, 'Authentication required', 401);
        }
        const token = header.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return (0, apiResponse_1.sendError)(res, 'Server configuration error', 500);
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return (0, apiResponse_1.sendError)(res, 'Invalid or inactive account', 401);
        }
        req.user = user;
        req.auth = decoded;
        next();
    }
    catch {
        return (0, apiResponse_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer ')) {
            return next();
        }
        const token = header.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return next();
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.User.findById(decoded.userId);
        if (user && user.isActive) {
            req.user = user;
            req.auth = decoded;
        }
        next();
    }
    catch {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 'Authentication required', 401);
        }
        if (!roles.includes(req.user.role)) {
            return (0, apiResponse_1.sendError)(res, 'Access denied', 403);
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
const requireActiveSupplier = async (req, res, next) => {
    if (!req.user) {
        return (0, apiResponse_1.sendError)(res, 'Authentication required', 401);
    }
    if (req.user.role !== 'supplier') {
        return (0, apiResponse_1.sendError)(res, 'Supplier access required', 403);
    }
    const profile = await SupplierProfile_1.SupplierProfile.findOne({ userId: req.user._id });
    if (!profile || profile.status !== 'active') {
        return (0, apiResponse_1.sendError)(res, 'Active supplier profile required', 403);
    }
    if (req.auth) {
        req.auth.supplierProfileId = profile._id.toString();
    }
    next();
};
exports.requireActiveSupplier = requireActiveSupplier;
//# sourceMappingURL=auth.js.map