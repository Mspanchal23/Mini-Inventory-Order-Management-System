import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { buildPaginationMeta, escapeRegex } from '../utils/helpers.js';

const LIVE = { isDeleted: false };

const ensureSkuAvailable = async (sku, excludeId) => {
  const filter = { ...LIVE, sku: sku.toUpperCase() };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Product.exists(filter)) {
    throw ApiError.conflict(`SKU "${sku.toUpperCase()}" is already used by another product`, [
      { field: 'sku', message: 'SKU must be unique' },
    ]);
  }
};

export const listProducts = async ({ page, limit, search, category, status, sortBy, order }) => {
  const filter = { ...LIVE };
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: regex }, { sku: regex }, { category: regex }];
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta(page, limit, total) };
};

export const getCategories = () => Product.distinct('category', LIVE);

export const getProductById = async (id) => {
  const product = await Product.findOne({ _id: id, ...LIVE }).lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

export const createProduct = async (data) => {
  await ensureSkuAvailable(data.sku);
  // The partial unique index still guards against a race between check and insert.
  return Product.create(data);
};

export const updateProduct = async (id, data) => {
  if (data.sku) await ensureSkuAvailable(data.sku, id);

  const product = await Product.findOneAndUpdate({ _id: id, ...LIVE }, data, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};

/**
 * Soft delete. Existing orders keep their product snapshot, and the SKU becomes
 * free to reuse because the unique index only covers non-deleted products.
 */
export const deleteProduct = async (id) => {
  const product = await Product.findOneAndUpdate(
    { _id: id, ...LIVE },
    { isDeleted: true, deletedAt: new Date(), status: 'Inactive' },
    { returnDocument: 'after' },
  ).lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product;
};
