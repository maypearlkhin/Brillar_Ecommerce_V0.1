"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const integration_controller_1 = require("../controllers/integration.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/widget', auth_1.authenticate, integration_controller_1.getRoleWidget);
exports.default = router;
//# sourceMappingURL=integration.routes.js.map