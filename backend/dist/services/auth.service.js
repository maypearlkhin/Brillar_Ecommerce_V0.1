"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const SupplierProfile_1 = require("../models/SupplierProfile");
const SupplierApplication_1 = require("../models/SupplierApplication");
const auth_1 = require("../utils/auth");
class AuthService {
    static async register(data) {
        const existing = await User_1.User.findOne({ email: data.email.toLowerCase() });
        if (existing)
            throw new Error('Email already registered');
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const user = await User_1.User.create({
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash,
            phone: data.phone,
            role: 'customer',
        });
        const token = await (0, auth_1.generateToken)(user);
        return { user: (0, auth_1.sanitizeUser)(user), token };
    }
    static async login(email, password) {
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user || !user.isActive)
            throw new Error('Invalid credentials');
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            throw new Error('Invalid credentials');
        const token = await (0, auth_1.generateToken)(user);
        let supplierStatus = null;
        if (user.role === 'supplier') {
            const profile = await SupplierProfile_1.SupplierProfile.findOne({ userId: user._id });
            supplierStatus = profile?.status || null;
        }
        else {
            const application = await SupplierApplication_1.SupplierApplication.findOne({ userId: user._id }).sort({
                createdAt: -1,
            });
            if (application)
                supplierStatus = application.status;
        }
        return { user: (0, auth_1.sanitizeUser)(user), token, supplierStatus };
    }
    static async getProfile(userId) {
        const user = await User_1.User.findById(userId);
        if (!user)
            throw new Error('User not found');
        return (0, auth_1.sanitizeUser)(user);
    }
    static async updateProfile(userId, data) {
        const user = await User_1.User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
        if (!user)
            throw new Error('User not found');
        return (0, auth_1.sanitizeUser)(user);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map