import * as orderService from '../services/order.service.js';
import { sendSuccess } from '../utils/helpers.js';

export const listOrders = async (req, res) => {
  const { items, meta } = await orderService.listOrders(req.query);
  sendSuccess(res, { data: items, meta });
};

export const getOrder = async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  sendSuccess(res, { data: order });
};

export const createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.body);
  sendSuccess(res, { status: 201, message: 'Order created', data: order });
};

export const updateOrder = async (req, res) => {
  const order = await orderService.updateOrder(req.params.id, req.body);
  sendSuccess(res, { message: 'Order updated', data: order });
};

export const confirmOrder = async (req, res) => {
  const order = await orderService.confirmOrder(req.params.id);
  sendSuccess(res, { message: 'Order confirmed, stock updated', data: order });
};

export const cancelOrder = async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id);
  sendSuccess(res, { message: 'Order cancelled', data: order });
};
