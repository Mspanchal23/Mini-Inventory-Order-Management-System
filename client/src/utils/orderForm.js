import { toMoney } from './format';

/** Helpers for the create/edit order form: line items, validation and payload mapping. */

export const EMPTY_CUSTOMER = { id: null, name: '', phone: '', email: '', address: '' };

let lineCounter = 0;
export const createLine = (product = null, quantity = '1') => ({
  key: `line-${(lineCounter += 1)}`,
  product,
  quantity: String(quantity),
});

export const lineTotal = (line) => toMoney((line.product?.price || 0) * (Number(line.quantity) || 0));

/** Turn an order from the API into form state (used when editing a pending order). */
export const orderToForm = (order) => ({
  customer: {
    id: order.customer?._id || order.customer || null,
    name: order.customerSnapshot.name,
    phone: order.customerSnapshot.phone || '',
    email: order.customerSnapshot.email || '',
    address: order.customerSnapshot.address,
  },
  items: order.items.map((item) =>
    createLine(
      {
        _id: item.product?._id || item.product,
        name: item.name,
        sku: item.sku,
        // Current product values: the order is re-priced at current prices when saved.
        price: item.product?.price ?? item.unitPrice,
        stock: item.product?.stock ?? 0,
        status: item.product?.status,
        isDeleted: item.product?.isDeleted,
      },
      item.quantity,
    ),
  ),
  notes: order.notes || '',
});

const PHONE_PATTERN = /^[+\d][\d\s-]{6,19}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns { customer: {field: msg}, items: {lineKey: {field: msg}}, hasErrors }. */
export const validateOrderForm = ({ customer, items }) => {
  const customerErrors = {};
  const itemErrors = {};

  if (customer.name.trim().length < 2) customerErrors.name = 'Customer name is required (min 2 characters)';
  if (customer.address.trim().length < 5) customerErrors.address = 'Address is required (min 5 characters)';
  if (customer.phone.trim() && !PHONE_PATTERN.test(customer.phone.trim())) customerErrors.phone = 'Enter a valid phone number';
  if (customer.email.trim() && !EMAIL_PATTERN.test(customer.email.trim())) customerErrors.email = 'Enter a valid email';

  items.forEach((line) => {
    const errors = {};
    const qty = Number(line.quantity);

    if (!line.product) errors.product = 'Select a product';
    else if (line.product.isDeleted) errors.product = 'This product has been deleted, remove it';
    else if (line.product.status && line.product.status !== 'Active') errors.product = 'This product is inactive, remove it';

    if (line.quantity === '' || !Number.isInteger(qty) || qty < 1) errors.quantity = 'Whole number, min 1';
    else if (line.product && qty > line.product.stock) errors.quantity = `Only ${line.product.stock} available`;

    if (Object.keys(errors).length) itemErrors[line.key] = errors;
  });

  return {
    customer: customerErrors,
    items: itemErrors,
    hasErrors: Object.keys(customerErrors).length > 0 || Object.keys(itemErrors).length > 0,
  };
};

export const toOrderPayload = ({ customer, items, notes }) => ({
  customer: {
    ...(customer.id && { id: customer.id }),
    name: customer.name.trim(),
    phone: customer.phone.trim(),
    email: customer.email.trim(),
    address: customer.address.trim(),
  },
  items: items.map((line) => ({ product: line.product._id, quantity: Number(line.quantity) })),
  notes: notes.trim(),
});

/** Map API errors back onto the form: customer.* fields and per-line (matched by SKU). */
export const mapOrderServerErrors = (apiErrors = [], items = []) => {
  const customer = {};
  const lines = {};

  apiErrors.forEach((err) => {
    if (err.field?.startsWith('customer.')) {
      customer[err.field.slice('customer.'.length)] = err.message;
      return;
    }
    const line = items.find((l) => (err.sku && l.product?.sku === err.sku) || (err.product && l.product?._id === err.product));
    if (line) lines[line.key] = { ...lines[line.key], quantity: err.message };
  });

  return { customer, items: lines };
};
