export const ORDER_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
});

export const PRODUCT_STATUS = Object.freeze(['Active', 'Inactive']);

/** MUI palette color for each status chip. */
export const STATUS_COLORS = Object.freeze({
  Pending: 'warning',
  Confirmed: 'success',
  Cancelled: 'error',
  Active: 'success',
  Inactive: 'secondary',
});

export const LOW_STOCK_THRESHOLD = 5;
