import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getCart: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addToCart: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCartItem: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const removeCartItem: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const clearCart: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkout: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const buyAgain: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=order.controller.d.ts.map