"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoleWidget = void 0;
const admin_service_1 = require("../services/admin.service");
const apiResponse_1 = require("../utils/apiResponse");
const getRoleWidget = async (req, res) => {
    try {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 'Authentication required', 401);
        }
        const requestedRole = typeof req.query.role === 'string' ? req.query.role : undefined;
        if (requestedRole && requestedRole !== req.user.role) {
            return (0, apiResponse_1.sendSuccess)(res, null);
        }
        const widget = await admin_service_1.ConfigurationService.getWidgetForRole(req.user.role);
        return (0, apiResponse_1.sendSuccess)(res, widget);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getRoleWidget = getRoleWidget;
//# sourceMappingURL=integration.controller.js.map