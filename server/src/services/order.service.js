import Order, { ORDER_STATUS } from '../models/Order.js';
import Product from '../models/Product.js';
import { nextSequence } from '../models/Counter.js';
import ApiError from '../utils/ApiError.js';
import { buildPaginationMeta, escapeRegex, toMoney } from '../utils/helpers.js';
import { resolveCustomer } from './customer.service.js';
import { deductStock, restoreStock } from './stock.service.js';

const { PENDING, CONFIRMED, CANCELLED } = ORDER_STATUS;

/** Same product added more than once in one order: merge into one line, sum the quantities. */
const mergeDuplicateItems = (items) => {
  const merged = new Map();
  for (const { product, quantity } of items) {
    merged.set(product, (merged.get(product) || 0) + quantity);
  }
  return [...merged].map(([product, quantity]) => ({ product, quantity }));
};

/**
 * Validate the requested lines against current products and build price snapshots.
 * The total is always computed here from DB prices, never trusted from the client.
 */
const buildOrderItems = async (rawItems) => {
  const requested = mergeDuplicateItems(rawItems);
  const products = await Product.find({
    _id: { $in: requested.map((item) => item.product) },
    isDeleted: false,
  }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const errors = [];
  let hasStockIssue = false;
  const items = requested.map(({ product: productId, quantity }) => {
    const product = productMap.get(productId);
    if (!product) {
      errors.push({ field: 'items', product: productId, message: 'Product not found or deleted' });
      return null;
    }
    if (product.status !== 'Active') {
      errors.push({ field: 'items', sku: product.sku, message: `"${product.name}" is inactive` });
    } else if (quantity > product.stock) {
      hasStockIssue = true;
      errors.push({
        field: 'items',
        sku: product.sku,
        message: `Only ${product.stock} unit(s) of "${product.name}" available, requested ${quantity}`,
      });
    }
    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.price,
      quantity,
      lineTotal: toMoney(product.price * quantity),
    };
  });

  if (errors.length) {
    throw hasStockIssue
      ? ApiError.conflict('Requested quantity exceeds available stock', errors)
      : ApiError.badRequest('Some products are not available', errors);
  }

  const totalAmount = toMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  return { items, totalAmount };
};

const toCustomerSnapshot = ({ name, phone, email, address }) => ({ name, phone, email, address });

/**
 * Called when a guarded status update matched nothing: work out why and return
 * the right error (404, already cancelled, not editable, busy...).
 */
const explainBlockedAction = async (id, action) => {
  const order = await Order.findById(id).select('status +isProcessing').lean();
  if (!order) return ApiError.notFound('Order not found');
  if (order.isProcessing) return ApiError.conflict('Order is being processed, please try again');

  const messages = {
    confirm: {
      [CONFIRMED]: 'Order is already confirmed',
      [CANCELLED]: 'A cancelled order cannot be confirmed',
    },
    cancel: {
      [CANCELLED]: 'Order is already cancelled',
    },
    edit: {
      [CONFIRMED]: 'A confirmed order cannot be edited. Cancel it and create a new order instead.',
      [CANCELLED]: 'A cancelled order cannot be edited',
    },
  };
  return ApiError.badRequest(
    messages[action][order.status] || `Order cannot be ${action}ed in its current state`,
  );
};

export const listOrders = async ({ page, limit, search, status, sortBy, order }) => {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ orderNo: regex }, { 'customerSnapshot.name': regex }];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const items = orders.map(({ items: lines, ...rest }) => ({
    ...rest,
    itemCount: lines.length,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  }));

  return { items, meta: buildPaginationMeta(page, limit, total) };
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate('items.product', 'isDeleted status stock price')
    .lean();
  if (!order) throw ApiError.notFound('Order not found');
  return order;
};

export const createOrder = async ({ customer: customerInput, items: rawItems, notes = '' }) => {
  // Validate products first so a bad request does not leave a stray customer behind.
  const { items, totalAmount } = await buildOrderItems(rawItems);
  const customer = await resolveCustomer(customerInput);
  const seq = await nextSequence('order');

  const order = await Order.create({
    orderNo: `ORD-${String(seq).padStart(5, '0')}`,
    customer: customer._id,
    customerSnapshot: toCustomerSnapshot(customer),
    items,
    totalAmount,
    notes,
  });
  return order.toObject();
};

/** Only pending orders can be edited; items are re-priced at current prices. */
export const updateOrder = async (id, { customer: customerInput, items: rawItems, notes = '' }) => {
  const existing = await Order.findById(id).select('status').lean();
  if (!existing) throw ApiError.notFound('Order not found');
  if (existing.status !== PENDING) throw await explainBlockedAction(id, 'edit');

  const { items, totalAmount } = await buildOrderItems(rawItems);
  const customer = await resolveCustomer(customerInput);

  // Guarded write: if the order was confirmed/cancelled meanwhile, nothing is changed.
  const order = await Order.findOneAndUpdate(
    { _id: id, status: PENDING, isProcessing: { $ne: true } },
    {
      customer: customer._id,
      customerSnapshot: toCustomerSnapshot(customer),
      items,
      totalAmount,
      notes,
    },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  if (!order) throw await explainBlockedAction(id, 'edit');
  return order;
};

/**
 * Pending -> Confirmed. The order is first locked (isProcessing) with an atomic
 * guarded update so the same order cannot be confirmed/cancelled/edited twice at
 * once, then stock is deducted all-or-nothing. On failure the lock is released and
 * the order stays Pending.
 */
export const confirmOrder = async (id) => {
  const locked = await Order.findOneAndUpdate(
    { _id: id, status: PENDING, isProcessing: { $ne: true } },
    { $set: { isProcessing: true } },
    { returnDocument: 'after' },
  ).lean();
  if (!locked) throw await explainBlockedAction(id, 'confirm');

  try {
    await deductStock(locked.items);
  } catch (error) {
    await Order.updateOne({ _id: id }, { $set: { isProcessing: false } });
    throw error;
  }

  return Order.findByIdAndUpdate(
    id,
    { $set: { status: CONFIRMED, confirmedAt: new Date(), isProcessing: false } },
    { returnDocument: 'after' },
  ).lean();
};

/**
 * Pending/Confirmed -> Cancelled. The guarded update only matches a non-cancelled
 * order, so a second cancel finds nothing and stock is never restored twice.
 * Stock is returned only if the order had been confirmed (i.e. stock was deducted).
 */
export const cancelOrder = async (id) => {
  const previous = await Order.findOneAndUpdate(
    { _id: id, status: { $in: [PENDING, CONFIRMED] }, isProcessing: { $ne: true } },
    { $set: { status: CANCELLED, cancelledAt: new Date() } },
    { returnDocument: 'before' },
  ).lean();
  if (!previous) throw await explainBlockedAction(id, 'cancel');

  if (previous.status === CONFIRMED) await restoreStock(previous.items);

  return Order.findById(id).lean();
};
