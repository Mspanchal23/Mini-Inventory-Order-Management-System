import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { Alert, Box, Button, Divider, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useNotify } from '../../context/NotificationContext';
import { formatCurrency } from '../../utils/format';
import { createLine, lineTotal } from '../../utils/orderForm';
import StockLabel from '../products/StockLabel';
import ProductPicker from './ProductPicker';

/**
 * Editable list of order lines. Selecting a product that is already in the order
 * merges the quantities into the existing line instead of creating a duplicate.
 */
export default function OrderItemsEditor({ items, onChange, errors = {}, error }) {
  const notify = useNotify();

  const updateLine = (key, patch) => onChange(items.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const handleProductChange = (line, product) => {
    const duplicate = product && items.find((other) => other.key !== line.key && other.product?._id === product._id);
    if (duplicate) {
      const mergedQty = (Number(duplicate.quantity) || 0) + (Number(line.quantity) || 1);
      onChange(
        items
          .filter((other) => other.key !== line.key)
          .map((other) => (other.key === duplicate.key ? { ...other, quantity: String(mergedQty) } : other)),
      );
      notify.info(`"${product.name}" is already in this order, quantities were merged.`);
      return;
    }
    updateLine(line.key, { product });
  };

  const removeLine = (key) => onChange(items.filter((line) => line.key !== key));

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}

      {items.map((line, index) => {
        const lineErrors = errors[line.key] || {};
        return (
          <Fragment key={line.key}>
            {index > 0 && <Divider />}
            <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <ProductPicker
                  value={line.product}
                  onChange={(product) => handleProductChange(line, product)}
                  error={Boolean(lineErrors.product)}
                  helperText={lineErrors.product}
                />
              </Grid>
              <Grid size={{ xs: 4, md: 2 }}>
                <TextField
                  label="Qty"
                  type="number"
                  required
                  value={line.quantity}
                  onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                  error={Boolean(lineErrors.quantity)}
                  helperText={lineErrors.quantity}
                  fullWidth
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                />
              </Grid>
              <Grid size={{ xs: 8, md: 4 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 0.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" component="div">
                      Unit price · In stock
                    </Typography>
                    <Typography variant="body2" component="div">
                      {line.product ? formatCurrency(line.product.price) : '-'}
                      {' · '}
                      {line.product ? <StockLabel stock={line.product.stock} showText={false} /> : '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" component="div">
                      Line total
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(lineTotal(line))}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Remove item">
                  <span>
                    <IconButton
                      color="error"
                      onClick={() => removeLine(line.key)}
                      disabled={items.length === 1}
                      aria-label="Remove item"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Fragment>
        );
      })}

      <Box>
        <Button startIcon={<AddIcon />} onClick={() => onChange([...items, createLine()])}>
          Add another product
        </Button>
      </Box>
    </Stack>
  );
}
