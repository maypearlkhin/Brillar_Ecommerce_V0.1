import { Response } from 'express';
import {
  SupplierApplicationService,
  SupplierService,
  AdminSupplierService,
} from '../services/supplier.service';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getParam } from '../utils/params';

export const submitApplication = async (req: AuthRequest, res: Response) => {
  try {
    const app = await SupplierApplicationService.submit(req.user!._id.toString(), req.body);
    return sendSuccess(res, app, 'Application submitted', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getMyApplication = async (req: AuthRequest, res: Response) => {
  try {
    const app = await SupplierApplicationService.getMyApplication(req.user!._id.toString());
    return sendSuccess(res, app);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const data = await SupplierService.getDashboard(req.auth!.supplierProfileId!);
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await SupplierService.getProfile(req.user!._id.toString());
    return sendSuccess(res, profile);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await SupplierService.updateProfile(req.user!._id.toString(), req.body);
    return sendSuccess(res, profile, 'Profile updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const result = await SupplierService.getProducts(
      req.auth!.supplierProfileId!,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 20,
      req.query.search as string | undefined,
      req.query.status as string | undefined
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await SupplierService.createProduct(req.auth!.supplierProfileId!, req.body);
    return sendSuccess(res, product, 'Product created', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await SupplierService.updateProduct(
      req.auth!.supplierProfileId!,
      getParam(req.params.id),
      req.body
    );
    return sendSuccess(res, product, 'Product updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const result = await SupplierService.getOrders(
      req.auth!.supplierProfileId!,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 10
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateFulfillment = async (req: AuthRequest, res: Response) => {
  try {
    const order = await SupplierService.updateFulfillment(
      req.auth!.supplierProfileId!,
      getParam(req.params.id),
      req.body.fulfillmentStatus
    );
    return sendSuccess(res, order, 'Fulfillment status updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const earnings = await SupplierService.getEarnings(req.auth!.supplierProfileId!);
    return sendSuccess(res, earnings);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getFinancials = async (req: AuthRequest, res: Response) => {
  try {
    const financials = await SupplierService.getEarnings(req.auth!.supplierProfileId!);
    return sendSuccess(res, financials);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await SupplierService.getInventory(
      req.auth!.supplierProfileId!,
      Number(req.query.page) || 1,
      Number(req.query.limit) || 50
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getSupplierCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await SupplierService.getCategories(req.auth!.supplierProfileId!);
    return sendSuccess(res, categories);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const archiveProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await SupplierService.archiveProduct(
      req.auth!.supplierProfileId!,
      getParam(req.params.id)
    );
    return sendSuccess(res, product, 'Product archived');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const updateStock = async (req: AuthRequest, res: Response) => {
  try {
    const product = await SupplierService.updateStock(
      req.auth!.supplierProfileId!,
      getParam(req.params.id),
      Number(req.body.stockQuantity)
    );
    return sendSuccess(res, product, 'Stock updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const uploadProductImages = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) return sendError(res, 'No images uploaded', 400);

    const port = process.env.PORT || '5000';
    const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${port}`;
    const urls = files.map((file) => `${baseUrl}/uploads/products/${file.filename}`);
    return sendSuccess(res, { urls }, 'Images uploaded');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

// Admin supplier controllers
export const adminGetApplications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminSupplierService.getApplications(
      req.query.status as string,
      Number(req.query.page) || 1
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const adminGetApplication = async (req: AuthRequest, res: Response) => {
  try {
    const app = await AdminSupplierService.getApplication(getParam(req.params.id));
    return sendSuccess(res, app);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const adminApproveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const app = await AdminSupplierService.approveApplication(
      getParam(req.params.id),
      req.user!._id.toString()
    );
    return sendSuccess(res, app, 'Application approved');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const adminRejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const app = await AdminSupplierService.rejectApplication(
      getParam(req.params.id),
      req.user!._id.toString(),
      req.body.adminNote
    );
    return sendSuccess(res, app, 'Application rejected');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const adminRequestMoreInfo = async (req: AuthRequest, res: Response) => {
  try {
    const app = await AdminSupplierService.requestMoreInfo(
      getParam(req.params.id),
      req.user!._id.toString(),
      req.body.adminNote
    );
    return sendSuccess(res, app, 'More information requested');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const adminGetSuppliers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminSupplierService.getSuppliers(
      req.query.status as string,
      Number(req.query.page) || 1
    );
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const adminSuspendSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await AdminSupplierService.suspendSupplier(
      getParam(req.params.id),
      req.user!._id.toString()
    );
    return sendSuccess(res, profile, 'Supplier suspended');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const adminReactivateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await AdminSupplierService.reactivateSupplier(getParam(req.params.id));
    return sendSuccess(res, profile, 'Supplier reactivated');
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};

export const adminCreateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const result = await AdminSupplierService.createSupplierManually(req.body);
    return sendSuccess(res, result, 'Supplier created', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 400);
  }
};
