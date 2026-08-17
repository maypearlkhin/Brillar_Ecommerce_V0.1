"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const errorHandler = (err, _req, res, _next) => {
    console.error(err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error';
    return (0, apiResponse_1.sendError)(res, message, 500);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (_req, res) => {
    return (0, apiResponse_1.sendError)(res, 'Resource not found', 404);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map