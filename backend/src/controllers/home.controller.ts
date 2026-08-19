import { Response } from 'express';
import { HomeService } from '../services/home.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthRequest } from '../middleware/auth';

export const getHomeData = async (req: AuthRequest, res: Response) => {
  try {
    const data = await HomeService.getHomeData(req.user?._id?.toString());
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
