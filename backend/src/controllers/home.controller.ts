import { Request, Response } from 'express';
import { HomeService } from '../services/home.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getHomeData = async (_req: Request, res: Response) => {
  try {
    const data = await HomeService.getHomeData();
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
