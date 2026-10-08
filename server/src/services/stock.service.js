import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

const describeStockFailure = async (item) => {
  const product = await Product.findById(item.product).select('stock status isDeleted').lean();

  if (!product || product.isDeleted) {
    return `"${item.name}" (${item.sku}) is no longer available`;
  }
  if (product.status !== 'Active') {
    return `"${item.name}" (${item.sku}) is inactive`;
  }
  return `Insufficient stock for "${item.name}" (${item.sku}). Available: ${product.stock}, requested: ${item.quantity}`;
};

/** Put stock back for the given order lines. */
export const restoreStock = async (items) => {
  if (!items.length) return;
  await Product.bulkWrite(
    items.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: item.quantity } },
      },
    })),
  );
};

/**
 * Deduct stock for every line, all-or-nothing.
 *
 * Each decrement is a single atomic conditional update (`stock >= quantity`), so when
 * two orders compete for the last units MongoDB lets only one of them match. If any
 * line fails, the lines already deducted are rolled back and a 409 is thrown.
 * This works on a standalone MongoDB (no replica set / transactions required).
 */
export const deductStock = async (items) => {
  const applied = [];

  for (const item of items) {
    const result = await Product.updateOne(
      {
        _id: item.product,
        isDeleted: false,
        status: 'Active',
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity } },
    );

    if (result.modifiedCount !== 1) {
      await restoreStock(applied);
      const message = await describeStockFailure(item);
      throw ApiError.conflict(message, [{ field: 'items', sku: item.sku, message }]);
    }
    applied.push(item);
  }
};
