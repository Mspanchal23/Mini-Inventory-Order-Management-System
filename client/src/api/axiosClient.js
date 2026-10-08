import axios from 'axios';

/** Normalized error thrown by every API call: { status, message, errors[] }. */
export class ApiRequestError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Drop empty query params so URLs stay clean (?search=&status= -> nothing).
axiosClient.interceptors.request.use((config) => {
  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(([, value]) => value !== '' && value != null),
    );
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    const message =
      data?.message ||
      (status === 0 ? 'Cannot reach the server. Please check that the API is running.' : error.message);
    return Promise.reject(new ApiRequestError(status, message, data?.errors));
  },
);

export default axiosClient;
