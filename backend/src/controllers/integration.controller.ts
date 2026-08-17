import { Response } from 'express';
import { ConfigurationService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getRoleWidget = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const requestedRole = typeof req.query.role === 'string' ? req.query.role : undefined;
    if (requestedRole && requestedRole !== req.user.role) {
      return sendSuccess(res, null);
    }

    const widget = await ConfigurationService.getWidgetForRole(req.user.role);
    return sendSuccess(res, widget);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
