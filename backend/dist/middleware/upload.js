"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productImageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'products');
fs_1.default.mkdirSync(uploadDir, { recursive: true });
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const safeExt = allowedExtensions.has(ext) ? ext : '.jpg';
        cb(null, `${Date.now()}-${crypto_1.default.randomBytes(8).toString('hex')}${safeExt}`);
    },
});
exports.productImageUpload = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed'));
            return;
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});
//# sourceMappingURL=upload.js.map