import { searchCustomers } from '../services/customer.service.js';
import { getDashboardStats } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/helpers.js';

export const listCustomers = async (req, res) => {
  sendSuccess(res, { data: await searchCustomers(req.query) });
};

export const dashboardStats = async (_req, res) => {
  sendSuccess(res, { data: await getDashboardStats() });
};
