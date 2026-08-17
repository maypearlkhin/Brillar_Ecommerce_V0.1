import { Response } from 'express';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: string[]) => Response<any, Record<string, any>>;
//# sourceMappingURL=apiResponse.d.ts.map