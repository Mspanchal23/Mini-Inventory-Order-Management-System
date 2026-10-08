/** Uniform success payload: { success, message?, data, meta? } */
export const sendSuccess = (res, { status = 200, message, data, meta } = {}) =>
  res.status(status).json({
    success: true,
    ...(message && { message }),
    data,
    ...(meta && { meta }),
  });

/** Round to 2 decimals without floating point drift (e.g. 0.1 + 0.2). */
export const toMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/** Escape user input before using it inside a RegExp. */
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});
