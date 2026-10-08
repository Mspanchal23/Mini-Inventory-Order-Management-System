import { Autocomplete, Box, Grid, TextField, Typography } from '@mui/material';
import { customerApi } from '../../api';
import useAsyncOptions from '../../hooks/useAsyncOptions';
import useDebounce from '../../hooks/useDebounce';
import { EMPTY_CUSTOMER } from '../../utils/orderForm';

const fromCustomer = (c) => ({ id: c._id, name: c.name, phone: c.phone || '', email: c.email || '', address: c.address });
const fetchCustomers = (search) => customerApi.search({ search, limit: 8 });

/**
 * Customer name with search over existing customers. Picking one reuses that
 * customer record; typing a new name creates a new customer with the order.
 */
export default function CustomerFields({ value, onChange, errors = {} }) {
  const debouncedName = useDebounce(value.name, 300);
  const { options, loading } = useAsyncOptions(fetchCustomers, debouncedName);

  const setField = (field) => (event) => onChange({ ...value, [field]: event.target.value });

  let nameHint = 'Search an existing customer or type a new name';
  if (value.id) nameHint = 'Existing customer selected';
  else if (value.name.trim()) nameHint = 'A new customer will be created';

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Autocomplete
          freeSolo
          options={options}
          loading={loading}
          filterOptions={(opts) => opts}
          value={value.id ? { _id: value.id, name: value.name } : null}
          inputValue={value.name}
          getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.name)}
          isOptionEqualToValue={(opt, val) => opt._id === val._id}
          onChange={(_e, option) => {
            if (option && typeof option === 'object') onChange(fromCustomer(option));
          }}
          onInputChange={(_e, text, reason) => {
            if (reason === 'input') onChange({ ...value, id: null, name: text });
            if (reason === 'clear') onChange(EMPTY_CUSTOMER);
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Box component="li" key={key} {...rest}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[option.phone, option.address].filter(Boolean).join(' · ')}
                  </Typography>
                </Box>
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer name"
              required
              error={Boolean(errors.name)}
              helperText={errors.name || nameHint}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Phone"
          value={value.phone}
          onChange={setField('phone')}
          error={Boolean(errors.phone)}
          helperText={errors.phone || ' '}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Email"
          type="email"
          value={value.email}
          onChange={setField('email')}
          error={Boolean(errors.email)}
          helperText={errors.email || ' '}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Address"
          required
          multiline
          minRows={1}
          value={value.address}
          onChange={setField('address')}
          error={Boolean(errors.address)}
          helperText={errors.address || ' '}
          fullWidth
        />
      </Grid>
    </Grid>
  );
}
