"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = void 0;
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};
exports.generateOrderNumber = generateOrderNumber;
//# sourceMappingURL=orderNumber.js.map