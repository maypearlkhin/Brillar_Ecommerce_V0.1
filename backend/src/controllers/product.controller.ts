import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { ProductService } from '../services/product.service';
import { SupplierProfile } from '../models/SupplierProfile';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getParam } from '../utils/params';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getProducts({
      search: req.query.search as string,
      category: req.query.category as string,
      supplier: req.query.supplier as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      inStock: req.query.inStock === 'true',
      sort: req.query.sort as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    });
    return sendSuccess(res, result);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await ProductService.getProductById(getParam(req.params.id));
    return sendSuccess(res, product);
  } catch (err) {
    return sendError(res, (err as Error).message, 404);
  }
};

export const getFeatured = async (_req: Request, res: Response) => {
  try {
    const products = await ProductService.getFeatured();
    return sendSuccess(res, products);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    const withCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat.toObject(),
        productCount: await ProductService.countPublicActive(cat._id.toString()),
      }))
    );
    return sendSuccess(res, withCounts);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const suppliers = await SupplierProfile.find({ status: 'active' }).select('storeName slug description');
    return sendSuccess(res, suppliers);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
