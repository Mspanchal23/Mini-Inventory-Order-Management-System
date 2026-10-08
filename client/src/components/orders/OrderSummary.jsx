import { Divider, Stack, Typography } from '@mui/material';
import { formatCurrency, formatNumber, toMoney } from '../../utils/format';
import { lineTotal } from '../../utils/orderForm';

const Row = ({ label, value, bold }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
    <Typography variant={bold ? 'subtitle1' : 'body2'} color={bold ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: bold ? 700 : 400 }}>
      {label}
    </Typography>
    <Typography variant={bold ? 'subtitle1' : 'body2'} sx={{ fontWeight: bold ? 700 : 500 }}>
      {value}
    </Typography>
  </Stack>
);

/** Live total of the lines being edited. The server recalculates it from DB prices on save. */
export default function OrderSummary({ items }) {
  const selected = items.filter((line) => line.product);
  const units = selected.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  const total = toMoney(selected.reduce((sum, line) => sum + lineTotal(line), 0));

  return (
    <Stack spacing={1.25}>
      <Row label="Products" value={formatNumber(selected.length)} />
      <Row label="Total units" value={formatNumber(units)} />
      <Divider />
      <Row label="Total amount" value={formatCurrency(total)} bold />
      <Typography variant="caption" color="text.secondary">
        Prices are locked in when the order is saved. Later price changes will not affect this order.
      </Typography>
    </Stack>
  );
}
