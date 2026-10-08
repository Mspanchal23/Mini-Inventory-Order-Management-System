import config from '../config/env.js';
import Order, { ORDER_STATUS } from '../models/Order.js';
import Product from '../models/Product.js';
import { toMoney } from '../utils/helpers.js';

export const getDashboardStats = async () => {
  const live = { isDeleted: false };

  const [totalProducts, totalOrders, stockAgg, salesAgg, statusAgg, recentOrders, lowStockProducts] =
    await Promise.all([
      Product.countDocuments(live),
      Order.countDocuments(),
      Product.aggregate([{ $match: live }, { $group: { _id: null, total: { $sum: '$stock' } } }]),
      // Sales count only confirmed orders, using the totals frozen on each order.
      Order.aggregate([
        { $match: { status: ORDER_STATUS.CONFIRMED } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNo customerSnapshot.name totalAmount status createdAt')
        .lean(),
      Product.find({ ...live, stock: { $lte: config.lowStockThreshold } })
        .sort({ stock: 1 })
        .limit(5)
        .select('name sku stock status')
        .lean(),
    ]);

  const ordersByStatus = Object.fromEntries(Object.values(ORDER_STATUS).map((s) => [s, 0]));
  statusAgg.forEach(({ _id, count }) => {
    ordersByStatus[_id] = count;
  });

  return {
    totalProducts,
    totalOrders,
    totalStock: stockAgg[0]?.total || 0,
    totalSales: toMoney(salesAgg[0]?.total || 0),
    ordersByStatus,
    recentOrders,
    lowStockProducts,
    lowStockThreshold: config.lowStockThreshold,
  };
};
