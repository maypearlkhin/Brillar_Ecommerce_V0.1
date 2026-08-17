"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALLOWED_EMAIL_DOMAINS_MESSAGE = void 0;
exports.isAllowedCustomerSupplierEmail = isAllowedCustomerSupplierEmail;
const ALLOWED_EMAIL_DOMAINS = new Set(['ecommerce.com', 'gmail.com']);
exports.ALLOWED_EMAIL_DOMAINS_MESSAGE = 'Email must be an @ecommerce.com or @gmail.com address';
function isAllowedCustomerSupplierEmail(email) {
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2 || !parts[0])
        return false;
    return ALLOWED_EMAIL_DOMAINS.has(parts[1]);
}
//# sourceMappingURL=email.js.map