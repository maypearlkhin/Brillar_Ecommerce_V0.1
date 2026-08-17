"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const express_validator_1 = require("express-validator");
const apiResponse_1 = require("../utils/apiResponse");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.sendError)(res, 'Validation failed', 422, errors.array().map((e) => e.msg));
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map