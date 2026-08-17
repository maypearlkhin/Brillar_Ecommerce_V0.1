"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SupplierProfile_1 = require("../models/SupplierProfile");
const generateToken = async (user) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not defined');
    const payload = {
        userId: user._id.toString(),
        role: user.role,
    };
    if (user.role === 'supplier') {
        const profile = await SupplierProfile_1.SupplierProfile.findOne({ userId: user._id, status: 'active' });
        if (profile) {
            payload.supplierProfileId = profile._id.toString();
        }
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.generateToken = generateToken;
const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
});
exports.sanitizeUser = sanitizeUser;
//# sourceMappingURL=auth.js.map