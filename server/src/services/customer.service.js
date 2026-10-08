import Customer from '../models/Customer.js';
import ApiError from '../utils/ApiError.js';
import { escapeRegex } from '../utils/helpers.js';

export const searchCustomers = ({ search, limit }) => {
  const filter = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: regex }, { phone: regex }, { email: regex }];
  }
  return Customer.find(filter).sort({ updatedAt: -1 }).limit(limit).lean();
};

/**
 * Use the selected customer (refreshing their contact details) or create a new one.
 */
export const resolveCustomer = async ({ id, ...details }) => {
  if (!id) return Customer.create(details);

  const customer = await Customer.findByIdAndUpdate(id, details, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!customer) throw ApiError.notFound('Selected customer not found');
  return customer;
};
