"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
const register = async (req, res) => {
    try {
        const result = await auth_service_1.AuthService.register(req.body);
        return (0, apiResponse_1.sendSuccess)(res, result, 'Registration successful', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await auth_service_1.AuthService.login(req.body.email, req.body.password);
        return (0, apiResponse_1.sendSuccess)(res, result, 'Login successful');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 401);
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const profile = await auth_service_1.AuthService.getProfile(req.user._id.toString());
        return (0, apiResponse_1.sendSuccess)(res, profile);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 404);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const profile = await auth_service_1.AuthService.updateProfile(req.user._id.toString(), req.body);
        return (0, apiResponse_1.sendSuccess)(res, profile, 'Profile updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 400);
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=auth.controller.js.map