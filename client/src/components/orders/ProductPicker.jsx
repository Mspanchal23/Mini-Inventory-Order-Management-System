import { Autocomplete, Box, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { productApi } from '../../api';
import useAsyncOptions from '../../hooks/useAsyncOptions';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';

const fetchActiveProducts = (search) =>
  productApi.list({ status: 'Active', search, limit: 20, sortBy: 'name', order: 'asc' });

/** Searchable picker over active products. Out-of-stock products are shown but disabled. */
export default function ProductPicker({ value, onChange, error, helperText }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  // Only query the API while the dropdown is open.
  const { options, loading } = useAsyncOptions(fetchActiveProducts, debouncedSearch, open);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value}
      options={options}
      loading={loading}
      filterOptions={(opts) => opts}
      getOptionLabel={(opt) => `${opt.name} (${opt.sku})`}
      getOptionDisabled={(opt) => opt.stock <= 0}
      isOptionEqualToValue={(opt, val) => opt._id === val._id}
      onChange={(_e, product) => onChange(product)}
      onInputChange={(_e, text, reason) => {
        if (reason === 'input') setSearch(text);
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest}>
            <Stack sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.name}
              </Typography>
              <Typography variant="caption" color={option.stock > 0 ? 'text.secondary' : 'error'}>
                {option.sku} · {formatCurrency(option.price)} ·{' '}
                {option.stock > 0 ? `${option.stock} in stock` : 'Out of stock'}
              </Typography>
            </Stack>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label="Product" required error={error} helperText={helperText} />
      )}
    />
  );
}
