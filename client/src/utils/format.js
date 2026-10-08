const locale = import.meta.env.VITE_LOCALE || 'en-IN';
const currency = import.meta.env.VITE_CURRENCY || 'INR';

const currencyFormatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency,
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat(locale);
const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' });

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
export const currencySymbol =
  currencyFormatter.formatToParts(0).find((part) => part.type === 'currency')?.value || currency;
export const formatNumber = (value) => numberFormatter.format(Number(value) || 0);
export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '-');
export const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : '-');

/** Round to 2 decimals the same way the API does. */
export const toMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/** Convert API validation errors [{ field, message }] into { field: message }. */
export const mapFieldErrors = (errors = []) =>
  errors.reduce((acc, { field, message }) => {
    if (field && !acc[field]) acc[field] = message;
    return acc;
  }, {});
