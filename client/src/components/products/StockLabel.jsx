import { Typography } from '@mui/material';
import { LOW_STOCK_THRESHOLD } from '../../utils/constants';
import { formatNumber } from '../../utils/format';

/** Stock quantity colored by level: red when out of stock, orange when low. */
export default function StockLabel({ stock, showText = true, variant = 'body2' }) {
  let color = 'text.primary';
  let hint = '';
  if (stock <= 0) {
    color = 'error.main';
    hint = 'Out of stock';
  } else if (stock <= LOW_STOCK_THRESHOLD) {
    color = 'warning.dark';
    hint = 'Low';
  }

  return (
    <Typography component="span" variant={variant} sx={{ color, fontWeight: hint ? 600 : 400, whiteSpace: 'nowrap' }}>
      {formatNumber(stock)}
      {showText && hint && (
        <Typography component="span" variant="caption" sx={{ ml: 0.75 }}>
          ({hint})
        </Typography>
      )}
    </Typography>
  );
}
