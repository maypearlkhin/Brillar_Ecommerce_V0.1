"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const integration_routes_1 = __importDefault(require("./routes/integration.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'API is running' });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api', public_routes_1.default);
app.use('/api', customer_routes_1.default);
app.use('/api/supplier', supplier_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/integration', integration_routes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map