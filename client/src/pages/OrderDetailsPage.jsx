import { Alert, Box, Chip, Grid, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { orderApi } from '../api';
import DataTable from '../components/common/DataTable';
import InfoList from '../components/common/InfoList';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import { ErrorState, PageLoader } from '../components/common/StateViews';
import StatusChip from '../components/common/StatusChip';
import OrderActions from '../components/orders/OrderActions';
import StockLabel from '../components/products/StockLabel';
import useFetch from '../hooks/useFetch';
import useOrderActions from '../hooks/useOrderActions';
import { ORDER_STATUS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/format';

const STATUS_NOTES = {
  [ORDER_STATUS.PENDING]: { severity: 'info', text: 'This order is pending. Stock has not been deducted yet.' },
  [ORDER_STATUS.CONFIRMED]: { severity: 'success', text: 'Order confirmed. Stock was deducted for all items.' },
  [ORDER_STATUS.CANCELLED]: { severity: 'warning', text: 'This order was cancelled.' },
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: order, loading, error, refetch } = useFetch(() => orderApi.get(id), [id]);
  const actions = useOrderActions(refetch);

  if (loading && !order) return <PageLoader />;
  if (error) {
    return (
      <>
        <PageHeader title="Order" backTo="/orders" />
        <ErrorState message={error.message} onRetry={refetch} />
      </>
    );
  }

  const isPending = order.status === ORDER_STATUS.PENDING;
  const statusNote = STATUS_NOTES[order.status];

  const columns = [
    {
      id: 'name',
      label: 'Product',
      render: (item) => (
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
            {item.product?.isDeleted && <Chip label="Deleted" size="small" color="error" variant="outlined" />}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {item.sku}
          </Typography>
        </Box>
      ),
    },
    { id: 'unitPrice', label: 'Unit Price', align: 'right', render: (item) => formatCurrency(item.unitPrice) },
    { id: 'quantity', label: 'Qty', align: 'right' },
    // Pending orders have not reserved stock yet, so show what is currently available.
    ...(isPending
      ? [
          {
            id: 'available',
            label: 'In Stock',
            align: 'right',
            render: (item) => (item.product?.isDeleted ? '-' : <StockLabel stock={item.product?.stock ?? 0} showText={false} />),
          },
        ]
      : []),
    {
      id: 'lineTotal',
      label: 'Total',
      align: 'right',
      render: (item) => <strong>{formatCurrency(item.lineTotal)}</strong>,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Order ${order.orderNo}`}
        subtitle={`Created ${formatDateTime(order.createdAt)}`}
        backTo="/orders"
        actions={<OrderActions order={order} actions={actions} variant="buttons" />}
      >
        <StatusChip status={order.status} />
      </PageHeader>

      <Alert severity={statusNote.severity} sx={{ mb: 2.5 }}>
        {statusNote.text}
      </Alert>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title={`Items (${order.items.length})`} noPadding>
            <DataTable
              columns={columns}
              rows={order.items}
              rowKey="sku"
              sx={{ border: 0, borderRadius: 0 }}
            />
            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 4, px: 2.5, py: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" color="text.secondary">
                Total amount
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {formatCurrency(order.totalAmount)}
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2.5}>
            <SectionCard title="Customer">
              <InfoList
                items={[
                  { label: 'Name', value: order.customerSnapshot.name },
                  { label: 'Phone', value: order.customerSnapshot.phone },
                  { label: 'Email', value: order.customerSnapshot.email },
                  { label: 'Address', value: order.customerSnapshot.address },
                ]}
              />
            </SectionCard>
            <SectionCard title="Order Info">
              <InfoList
                items={[
                  { label: 'Status', value: <StatusChip status={order.status} /> },
                  { label: 'Created', value: formatDateTime(order.createdAt) },
                  { label: 'Confirmed', value: order.confirmedAt && formatDateTime(order.confirmedAt) },
                  { label: 'Cancelled', value: order.cancelledAt && formatDateTime(order.cancelledAt) },
                  { label: 'Last updated', value: formatDateTime(order.updatedAt) },
                  { label: 'Notes', value: order.notes },
                ]}
              />
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
