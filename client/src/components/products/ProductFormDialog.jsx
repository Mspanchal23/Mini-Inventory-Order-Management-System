import { Autocomplete, Grid, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import { productApi } from '../../api';
import { useNotify } from '../../context/NotificationContext';
import useFormState from '../../hooks/useFormState';
import { PRODUCT_STATUS } from '../../utils/constants';
import { currencySymbol, mapFieldErrors } from '../../utils/format';
import FilterSelect from '../common/FilterSelect';
import FormDialog from '../common/FormDialog';

const EMPTY_PRODUCT = {
  name: '',
  sku: '',
  price: '',
  stock: '',
  category: '',
  status: 'Active',
  description: '',
};

const toFormValues = (product) =>
  product
    ? {
        name: product.name,
        sku: product.sku,
        price: String(product.price),
        stock: String(product.stock),
        category: product.category,
        status: product.status,
        description: product.description || '',
      }
    : EMPTY_PRODUCT;

const validate = (values) => {
  const errors = {};
  const price = Number(values.price);
  const stock = Number(values.stock);

  if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!values.sku.trim()) errors.sku = 'SKU is required';
  else if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(values.sku.trim())) {
    errors.sku = 'Only letters, numbers, "-" and "_" are allowed';
  }
  if (values.price === '' || Number.isNaN(price) || price < 0) errors.price = 'Enter a valid price (0 or more)';
  else if (!/^\d+(\.\d{1,2})?$/.test(values.price.trim())) errors.price = 'Use at most 2 decimal places';
  if (values.stock === '' || !Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be a whole number (0 or more)';
  if (values.category.trim().length < 2) errors.category = 'Category is required';

  return errors;
};

export default function ProductFormDialog({ open, product, categories = [], onClose, onSaved }) {
  const isEdit = Boolean(product);
  const notify = useNotify();
  // The parent remounts this dialog (new `key`) each time it opens, so state starts fresh.
  const { values, errors, setErrors, setField, handleChange } = useFormState(() => toFormValues(product));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async () => {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...values,
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      category: values.category.trim(),
      description: values.description.trim(),
      price: Number(values.price),
      stock: Number(values.stock),
    };

    setSubmitting(true);
    setFormError('');
    try {
      const res = isEdit ? await productApi.update(product._id, payload) : await productApi.create(payload);
      notify.success(res.message);
      onSaved(res.data);
    } catch (error) {
      setErrors(mapFieldErrors(error.errors));
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    error: Boolean(errors[name]),
    helperText: errors[name],
    fullWidth: true,
  });

  return (
    <FormDialog
      open={open}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={isEdit ? 'Save Changes' : 'Add Product'}
      error={formError}
    >
      <Grid container spacing={2} sx={{ pt: 0.5 }}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField label="Product name" required autoFocus {...fieldProps('name')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="SKU"
            required
            {...fieldProps('sku')}
            slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Price"
            type="number"
            required
            {...fieldProps('price')}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment> },
              htmlInput: { min: 0, step: '0.01' },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Stock"
            type="number"
            required
            {...fieldProps('stock')}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete
            freeSolo
            options={categories}
            inputValue={values.category}
            onInputChange={(_e, value) => setField('category', value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                required
                error={Boolean(errors.category)}
                helperText={errors.category}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FilterSelect
            label="Status"
            value={values.status}
            onChange={(value) => setField('status', value)}
            options={PRODUCT_STATUS}
            fullWidth
            helperText={values.status === 'Inactive' ? 'Inactive products cannot be ordered' : ' '}
          />
        </Grid>
        <Grid size={12}>
          <TextField label="Description" multiline minRows={2} {...fieldProps('description')} />
        </Grid>
      </Grid>
    </FormDialog>
  );
}
