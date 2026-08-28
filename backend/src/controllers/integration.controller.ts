import { Response } from 'express';
import { ConfigurationService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { sendLoginEvent } from '../utils/atenxionLogin';
import { sendLogoutEvent } from '../utils/atenxionLogout';

export const getRoleWidget = async (req: AuthRequest, res: Response) => {
  try {
    const requestedRole = typeof req.query.role === 'string' ? req.query.role : undefined;

    if (!req.user) {
      if (requestedRole && requestedRole !== 'customer') {
        return sendSuccess(res, null);
      }
      const widget = await ConfigurationService.getWidgetForRole('customer');
      return sendSuccess(res, widget);
    }

    if (requestedRole && requestedRole !== req.user.role) {
      return sendSuccess(res, null);
    }

    const widget = await ConfigurationService.getWidgetForRole(req.user.role);
    return sendSuccess(res, widget);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const notifyUserLogin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id.toString();
    const requestedUserId = typeof req.body?.userId === 'string' ? req.body.userId : '';
    if (requestedUserId && requestedUserId !== userId) {
      return sendError(res, 'userId does not match the authenticated user', 403);
    }

    await sendLoginEvent(userId, req.user.role);
    return sendSuccess(res, { sent: true });
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const notifyUserLogout = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id.toString();
    const requestedUserId = typeof req.body?.userId === 'string' ? req.body.userId : '';
    if (requestedUserId && requestedUserId !== userId) {
      return sendError(res, 'userId does not match the authenticated user', 403);
    }

    await sendLogoutEvent(userId, req.user.role);
    return sendSuccess(res, { sent: true });
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
