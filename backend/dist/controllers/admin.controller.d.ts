import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getDashboard: (_req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCustomers: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCustomer: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleCustomerStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrders: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrder: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPublicFAQs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllFAQs: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createFAQ: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateFAQ: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteFAQ: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getConfiguration: (_req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createConfiguration: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteConfiguration: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCategory: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=admin.controller.d.ts.map