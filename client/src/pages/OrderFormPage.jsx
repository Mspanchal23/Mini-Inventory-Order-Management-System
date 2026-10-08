import SaveIcon from '@mui/icons-material/Save';
import { Alert, Box, Button, CircularProgress, Grid, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { orderApi } from '../api';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import { ErrorState, PageLoader } from '../components/common/StateViews';
import CustomerFields from '../components/orders/CustomerFields';
import OrderItemsEditor from '../components/orders/OrderItemsEditor';
import OrderSummary from '../components/orders/OrderSummary';
import { useNotify } from '../context/NotificationContext';
import useFetch from '../hooks/useFetch';
import { ORDER_STATUS } from '../utils/constants';
import {
  EMPTY_CUSTOMER,
  createLine,
  mapOrderServerErrors,
  orderToForm,
  toOrderPayload,
  validateOrderForm,
} from '../utils/orderForm';

const NO_ERRORS = { customer: {}, items: {} };

const emptyForm = () => ({ customer: EMPTY_CUSTOMER, items: [createLine()], notes: '' });

/** The form itself. `order` is null when creating, or a pending order when editing. */
function OrderForm({ order }) {
  const isEdit = Boolean(order);
  const navigate = useNavigate();
  const notify = useNotify();

  const [initial] = useState(() => (order ? orderToForm(order) : emptyForm()));
  const [customer, setCustomer] = useState(initial.customer);
  const [items, setItems] = useState(initial.items);
  const [notes, setNotes] = useState(initial.notes);
  const [errors, setErrors] = useState(NO_ERRORS);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const backTo = isEdit ? `/orders/${order._id}` : '/orders';

  const handleCustomerChange = (next) => {
    setCustomer(next);
    setErrors((prev) => ({ ...prev, customer: {} }));
  };

  const handleItemsChange = (next) => {
    setItems(next);
    setErrors((prev) => ({ ...prev, items: {} }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validateOrderForm({ customer, items });
    if (validation.hasErrors) {
      setErrors(validation);
      setFormError('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const payload = toOrderPayload({ customer, items, notes });
      const res = isEdit ? await orderApi.update(order._id, payload) : await orderApi.create(payload);
      notify.success(res.message);
      navigate(`/orders/${res.data._id}`);
    } catch (error) {
      setErrors(mapOrderServerErrors(error.errors, items));
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <PageHeader
        title={isEdit ? `Edit Order ${order.orderNo}` : 'New Order'}
        subtitle={isEdit ? 'Items are re-priced at current product prices when saved' : 'Create an order for a customer'}
        backTo={backTo}
      />

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
          {formError}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Customer">
              <CustomerFields value={customer} onChange={handleCustomerChange} errors={errors.customer} />
            </SectionCard>
            <SectionCard title="Items">
              <OrderItemsEditor items={items} onChange={handleItemsChange} errors={errors.items} />
            </SectionCard>
            <SectionCard title="Notes">
              <TextField
                placeholder="Delivery instructions or other notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                minRows={2}
                fullWidth
                slotProps={{ htmlInput: { maxLength: 500 } }}
              />
            </SectionCard>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
            <SectionCard title="Summary">
              <OrderSummary items={items} />
              <Stack spacing={1} sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                >
                  {isEdit ? 'Save Changes' : 'Create Order'}
                </Button>
                <Button component={RouterLink} to={backTo} color="inherit" disabled={submitting}>
                  Cancel
                </Button>
              </Stack>
              {!isEdit && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  New orders are saved as <strong>Pending</strong>. Stock is deducted only when the order is confirmed.
                </Alert>
              )}
            </SectionCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

/** Edit route: load the order first and only allow editing while it is pending. */
function EditOrder({ id }) {
  const { data: order, loading, error, refetch } = useFetch(() => orderApi.get(id), [id]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <>
        <PageHeader title="Edit Order" backTo="/orders" />
        <ErrorState message={error.message} onRetry={refetch} />
      </>
    );
  }
  if (order.status !== ORDER_STATUS.PENDING) {
    return (
      <>
        <PageHeader title={`Edit Order ${order.orderNo}`} backTo={`/orders/${id}`} />
        <Alert
          severity="warning"
          action={
            <Button component={RouterLink} to={`/orders/${id}`} color="inherit" size="small">
              View order
            </Button>
          }
        >
          Only pending orders can be edited. This order is {order.status.toLowerCase()}.
        </Alert>
      </>
    );
  }
  return <OrderForm key={order._id} order={order} />;
}

/** Route /orders/new creates an order, /orders/:id/edit edits a pending one. */
export default function OrderFormPage() {
  const { id } = useParams();
  return id ? <EditOrder id={id} /> : <OrderForm order={null} />;
}
