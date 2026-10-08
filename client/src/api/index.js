import axiosClient from './axiosClient';

export const productApi = {
  list: (params) => axiosClient.get('/products', { params }),
  categories: () => axiosClient.get('/products/categories'),
  get: (id) => axiosClient.get(`/products/${id}`),
  create: (data) => axiosClient.post('/products', data),
  update: (id, data) => axiosClient.put(`/products/${id}`, data),
  remove: (id) => axiosClient.delete(`/products/${id}`),
};

export const orderApi = {
  list: (params) => axiosClient.get('/orders', { params }),
  get: (id) => axiosClient.get(`/orders/${id}`),
  create: (data) => axiosClient.post('/orders', data),
  update: (id, data) => axiosClient.put(`/orders/${id}`, data),
  confirm: (id) => axiosClient.patch(`/orders/${id}/confirm`),
  cancel: (id) => axiosClient.patch(`/orders/${id}/cancel`),
};

export const customerApi = {
  search: (params) => axiosClient.get('/customers', { params }),
};

export const dashboardApi = {
  stats: () => axiosClient.get('/dashboard/stats'),
};
