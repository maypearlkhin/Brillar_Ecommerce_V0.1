"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMoney = exports.fromCents = exports.toCents = void 0;
/** Store money as integer cents to avoid floating-point issues */
const toCents = (amount) => Math.round(amount * 100);
exports.toCents = toCents;
const fromCents = (cents) => cents / 100;
exports.fromCents = fromCents;
const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;
exports.formatMoney = formatMoney;
//# sourceMappingURL=money.js.map