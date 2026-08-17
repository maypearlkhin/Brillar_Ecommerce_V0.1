"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomeData = void 0;
const home_service_1 = require("../services/home.service");
const apiResponse_1 = require("../utils/apiResponse");
const getHomeData = async (_req, res) => {
    try {
        const data = await home_service_1.HomeService.getHomeData();
        return (0, apiResponse_1.sendSuccess)(res, data);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getHomeData = getHomeData;
//# sourceMappingURL=home.controller.js.map