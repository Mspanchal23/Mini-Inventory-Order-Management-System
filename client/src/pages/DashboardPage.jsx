import PaymentsIcon from '@mui/icons-material/Payments';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { Button, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { dashboardApi } from '../api';
import DataTable from '../components/common/DataTable';
import PageHeader from '../components/common/PageHeader';
import SectionCard from '../components/common/SectionCard';
import StatCard from '../components/common/StatCard';
import { ErrorState } from '../components/common/StateViews';
import StatusChip from '../components/common/StatusChip';
import StockLabel from '../components/products/StockLabel';
import useFetch from '../hooks/useFetch';
import { ORDER_STATUS } from '../utils/constants';
import { formatCurrency, formatDateTime, formatNumber } from '../utils/format';

const recentOrderColumns = [
  {
    id: 'orderNo',
    label: 'Order',
    render: (row) => <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.orderNo}</Typography>,
  },
  { id: 'customer', label: 'Customer', render: (row) => row.customerSnapshot?.name },
  { id: 'totalAmount', label: 'Total', align: 'right', render: (row) => formatCurrency(row.totalAmount) },
  { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
  { id: 'createdAt', label: 'Date', render: (row) => formatDateTime(row.createdAt) },
];

const lowStockColumns = [
  {
    id: 'name',
    label: 'Product',
    render: (row) => (
      <>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{row.sku}</Typography>
      </>
    ),
  },
  { id: 'stock', label: 'Stock', align: 'right', render: (row) => <StockLabel stock={row.stock} /> },
];

const viewAll = (to) => (
  <Button component={RouterLink} to={to} size="small">
    View all
  </Button>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, loading, error, refetch } = useFetch(() => dashboardApi.stats(), []);

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorState message={error.message} onRetry={refetch} />
      </>
    );
  }

  const byStatus = stats?.ordersByStatus || {};
  const cards = [
    { label: 'Total Products', value: formatNumber(stats?.totalProducts), icon: <Inventory2Icon />, color: 'primary' },
    {
      label: 'Total Orders',
      value: formatNumber(stats?.totalOrders),
      icon: <ReceiptLongIcon />,
      color: 'info',
      caption: `${byStatus[ORDER_STATUS.PENDING] ?? 0} pending · ${byStatus[ORDER_STATUS.CONFIRMED] ?? 0} confirmed · ${byStatus[ORDER_STATUS.CANCELLED] ?? 0} cancelled`,
    },
    { label: 'Total Stock', value: formatNumber(stats?.totalStock), icon: <WarehouseIcon />, color: 'warning', caption: 'Units across all products' },
    { label: 'Total Sales', value: formatCurrency(stats?.totalSales), icon: <PaymentsIcon />, color: 'success', caption: 'From confirmed orders' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your inventory and orders" />

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard {...card} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionCard title="Recent Orders" action={viewAll('/orders')} noPadding>
            <DataTable
              columns={recentOrderColumns}
              rows={stats?.recentOrders || []}
              loading={loading}
              size="small"
              onRowClick={(row) => navigate(`/orders/${row._id}`)}
              emptyTitle="No orders yet"
              sx={{ border: 0, borderRadius: 0 }}
            />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title={
              <Stack component="span">
                Low Stock
                {stats && (
                  <Typography variant="caption" color="text.secondary">
                    {stats.lowStockThreshold} units or less
                  </Typography>
                )}
              </Stack>
            }
            action={viewAll('/products?sortBy=stock&order=asc')}
            noPadding
          >
            <DataTable
              columns={lowStockColumns}
              rows={stats?.lowStockProducts || []}
              loading={loading}
              size="small"
              emptyTitle="All products are well stocked"
              sx={{ border: 0, borderRadius: 0 }}
            />
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
