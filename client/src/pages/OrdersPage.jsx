import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { orderApi } from '../api';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import FilterSelect from '../components/common/FilterSelect';
import PageHeader from '../components/common/PageHeader';
import SearchField from '../components/common/SearchField';
import StatusChip from '../components/common/StatusChip';
import OrderActions from '../components/orders/OrderActions';
import useFetch from '../hooks/useFetch';
import useOrderActions from '../hooks/useOrderActions';
import useTableState from '../hooks/useTableState';
import { ORDER_STATUS } from '../utils/constants';
import { formatCurrency, formatDateTime } from '../utils/format';

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
};

const newOrderButton = (
  <Button component={RouterLink} to="/orders/new" variant="contained" startIcon={<AddIcon />}>
    New Order
  </Button>
);

export default function OrdersPage() {
  const navigate = useNavigate();
  const { params, setParams, toggleSort } = useTableState(DEFAULT_PARAMS);
  const orders = useFetch(() => orderApi.list(params), [JSON.stringify(params)]);
  const actions = useOrderActions(orders.refetch);
  const hasFilters = Boolean(params.search || params.status);

  const columns = [
    {
      id: 'orderNo',
      label: 'Order',
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
          {row.orderNo}
        </Typography>
      ),
    },
    {
      id: 'customer',
      label: 'Customer',
      render: (row) => (
        <Box sx={{ minWidth: 160 }}>
          <Typography variant="body2">{row.customerSnapshot.name}</Typography>
          {row.customerSnapshot.phone && (
            <Typography variant="caption" color="text.secondary">
              {row.customerSnapshot.phone}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      render: (row) => `${row.itemCount} product${row.itemCount === 1 ? '' : 's'} · ${row.totalQuantity} unit${row.totalQuantity === 1 ? '' : 's'}`,
    },
    {
      id: 'totalAmount',
      label: 'Total',
      align: 'right',
      sortable: true,
      render: (row) => <strong>{formatCurrency(row.totalAmount)}</strong>,
    },
    { id: 'status', label: 'Status', sortable: true, render: (row) => <StatusChip status={row.status} /> },
    { id: 'createdAt', label: 'Created', sortable: true, render: (row) => formatDateTime(row.createdAt) },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) => <OrderActions order={row} actions={actions} />,
    },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Track, confirm and cancel customer orders" actions={newOrderButton} />

      <FilterBar showReset={hasFilters} onReset={() => setParams({ search: '', status: '' })}>
        <SearchField
          value={params.search}
          onChange={(search) => setParams({ search })}
          placeholder="Search order no. or customer"
        />
        <FilterSelect
          label="Status"
          value={params.status}
          onChange={(status) => setParams({ status })}
          options={Object.values(ORDER_STATUS)}
          allLabel="All statuses"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={orders.data || []}
        loading={orders.loading}
        error={orders.error}
        onRetry={orders.refetch}
        onRowClick={(row) => navigate(`/orders/${row._id}`)}
        sort={{ sortBy: params.sortBy, order: params.order, onSort: toggleSort }}
        pagination={{
          page: params.page,
          limit: params.limit,
          total: orders.meta?.total,
          onPageChange: (page) => setParams({ page }),
          onLimitChange: (limit) => setParams({ limit }),
        }}
        emptyTitle={hasFilters ? 'No orders match your filters' : 'No orders yet'}
        emptyMessage={hasFilters ? 'Try a different search or clear the filters.' : 'Create the first order for a customer.'}
        emptyAction={!hasFilters && newOrderButton}
      />
    </>
  );
}
