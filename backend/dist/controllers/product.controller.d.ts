import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProducts: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProduct: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getFeatured: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCategories: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleProductLike: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSuppliers: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=product.controller.d.ts.map