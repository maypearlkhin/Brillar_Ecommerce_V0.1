"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuery = exports.getParam = void 0;
const getParam = (value) => {
    if (Array.isArray(value))
        return value[0];
    return value || '';
};
exports.getParam = getParam;
const getQuery = (value) => {
    if (Array.isArray(value))
        return String(value[0]);
    if (value === undefined || value === null)
        return '';
    return String(value);
};
exports.getQuery = getQuery;
//# sourceMappingURL=params.js.map