import * as productService from '../services/product.service.js';
import { sendSuccess } from '../utils/helpers.js';

export const listProducts = async (req, res) => {
  const { items, meta } = await productService.listProducts(req.query);
  sendSuccess(res, { data: items, meta });
};

export const getCategories = async (_req, res) => {
  const categories = await productService.getCategories();
  sendSuccess(res, { data: categories.sort() });
};

export const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  sendSuccess(res, { data: product });
};

export const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  sendSuccess(res, { status: 201, message: 'Product created', data: product });
};

export const updateProduct = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  sendSuccess(res, { message: 'Product updated', data: product });
};

export const deleteProduct = async (req, res) => {
  await productService.deleteProduct(req.params.id);
  sendSuccess(res, { message: 'Product deleted', data: { id: req.params.id } });
};
