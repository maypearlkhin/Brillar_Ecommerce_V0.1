import { Request, Response } from 'express';
import {
  AdminDashboardService,
  AdminCustomerService,
  AdminOrderService,
  FAQService,
  ConfigurationService,
} from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getParam } from '../utils/params';
import { IntegrationConfigType } from '../models/IntegrationConfig';
import { findOrCreateCategory } from '../services/category.service';

export const getDashboard = async (_req: AuthRequest, res: Response) => {
  try {
    const data = await AdminDashboardService.getDashboard();
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminCustomerService.getCustomers(
      req.query.search as string,
      Number(req.query.page) || 1
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const data = await AdminCustomerService.getCustomer(getParam(req.params.id));
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const toggleCustomerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminCustomerService.toggleCustomerStatus(getParam(req.params.id));
    return sendSuccess(res, result, 'Customer status updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminOrderService.getOrders(
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      req.query.status as string
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await AdminOrderService.getOrder(getParam(req.params.id));
    return sendSuccess(res, order);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const getPublicFAQs = async (req: Request, res: Response) => {
  try {
    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const faqs = await FAQService.getPublicFAQs({ page, limit });
    return sendSuccess(res, faqs);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getAllFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const page = req.query.page !== undefined ? Number(req.query.page) : undefined;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const faqs = await FAQService.getAllFAQs({ page, limit });
    return sendSuccess(res, faqs);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FAQService.createFAQ(req.body);
    return sendSuccess(res, faq, 'FAQ created', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const updateFAQ = async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FAQService.updateFAQ(getParam(req.params.id), req.body);
    return sendSuccess(res, faq, 'FAQ updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const deleteFAQ = async (req: AuthRequest, res: Response) => {
  try {
    await FAQService.deleteFAQ(getParam(req.params.id));
    return sendSuccess(res, null, 'FAQ deleted');
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const getConfiguration = async (_req: AuthRequest, res: Response) => {
  try {
    const data = await ConfigurationService.getAll();
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    const { type, url, token } = req.body;
    const config = await ConfigurationService.create(type, { url, token });
    return sendSuccess(res, config, 'Configuration saved', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const deleteConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    await ConfigurationService.remove(getParam(req.params.type) as IntegrationConfigType);
    return sendSuccess(res, null, 'Configuration removed');
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const category = await findOrCreateCategory(req.body.name);
    return sendSuccess(res, category, 'Category saved', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};
