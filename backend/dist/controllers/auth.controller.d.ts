import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const register: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const login: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map