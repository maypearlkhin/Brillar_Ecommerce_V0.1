import { Request, Response, NextFunction } from 'express';
import { IUser, UserRole } from '../models/User';
export interface AuthPayload {
    userId: string;
    role: UserRole;
    supplierProfileId?: string;
}
export interface AuthRequest extends Request {
    user?: IUser;
    auth?: AuthPayload;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeRoles: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireActiveSupplier: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map