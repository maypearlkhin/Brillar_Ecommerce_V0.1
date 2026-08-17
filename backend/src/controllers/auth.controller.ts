import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuthService.register(req.body);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    return sendError(res, (err as Error).message, 401);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await AuthService.getProfile(req.user!._id.toString());
    return sendSuccess(res, profile);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await AuthService.updateProfile(req.user!._id.toString(), req.body);
    return sendSuccess(res, profile, 'Profile updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};
