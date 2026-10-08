import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { productApi } from '../api';
import DataTable from '../components/common/DataTable';
import FilterBar from '../components/common/FilterBar';
import FilterSelect from '../components/common/FilterSelect';
import PageHeader from '../components/common/PageHeader';
import SearchField from '../components/common/SearchField';
import StatusChip from '../components/common/StatusChip';
import ProductFormDialog from '../components/products/ProductFormDialog';
import StockLabel from '../components/products/StockLabel';
import { useConfirm } from '../context/ConfirmContext';
import { useNotify } from '../context/NotificationContext';
import useFetch from '../hooks/useFetch';
import useTableState from '../hooks/useTableState';
import { PRODUCT_STATUS } from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/format';

const DEFAULT_PARAMS = {
  page: 1,
  limit: 10,
  search: '',
  category: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
};

export default function ProductsPage() {
  const notify = useNotify();
  const confirm = useConfirm();
  const { params, setParams, toggleSort } = useTableState(DEFAULT_PARAMS);
  const [dialog, setDialog] = useState({ open: false, product: null, key: 0 });

  const products = useFetch(() => productApi.list(params), [JSON.stringify(params)]);
  const categories = useFetch(() => productApi.categories(), []);
  const hasFilters = Boolean(params.search || params.category || params.status);

  const openDialog = (product = null) => setDialog((prev) => ({ open: true, product, key: prev.key + 1 }));
  const closeDialog = () => setDialog((prev) => ({ ...prev, open: false }));

  const handleSaved = () => {
    closeDialog();
    products.refetch();
    categories.refetch();
  };

  const handleDelete = async (product) => {
    const ok = await confirm({
      title: 'Delete product?',
      message: `"${product.name}" (${product.sku}) will be removed from the catalogue. Existing orders keep their details.`,
      confirmText: 'Delete',
      color: 'error',
    });
    if (!ok) return;

    try {
      const res = await productApi.remove(product._id);
      notify.success(res.message);
      // Step back a page if the last row on this page was removed.
      if (products.data?.length === 1 && params.page > 1) setParams({ page: params.page - 1 });
      else products.refetch();
      categories.refetch();
    } catch (error) {
      notify.error(error.message);
    }
  };

  const columns = [
    {
      id: 'name',
      label: 'Product',
      sortable: true,
      render: (row) => (
        <Box sx={{ minWidth: 180 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 260 }}>
              {row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'sku',
      label: 'SKU',
      sortable: true,
      render: (row) => <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{row.sku}</Typography>,
    },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'price', label: 'Price', align: 'right', sortable: true, render: (row) => formatCurrency(row.price) },
    { id: 'stock', label: 'Stock', align: 'right', sortable: true, render: (row) => <StockLabel stock={row.stock} /> },
    { id: 'status', label: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { id: 'updatedAt', label: 'Updated', sortable: true, render: (row) => formatDate(row.updatedAt) },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openDialog(row)} aria-label={`Edit ${row.name}`}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label={`Delete ${row.name}`}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Manage your catalogue, prices and stock levels"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
            Add Product
          </Button>
        }
      />

      <FilterBar showReset={hasFilters} onReset={() => setParams({ search: '', category: '', status: '' })}>
        <SearchField
          value={params.search}
          onChange={(search) => setParams({ search })}
          placeholder="Search name, SKU or category"
        />
        <FilterSelect
          label="Category"
          value={params.category}
          onChange={(category) => setParams({ category })}
          options={categories.data || []}
          allLabel="All categories"
        />
        <FilterSelect
          label="Status"
          value={params.status}
          onChange={(status) => setParams({ status })}
          options={PRODUCT_STATUS}
          allLabel="All statuses"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={products.data || []}
        loading={products.loading}
        error={products.error}
        onRetry={products.refetch}
        sort={{ sortBy: params.sortBy, order: params.order, onSort: toggleSort }}
        pagination={{
          page: params.page,
          limit: params.limit,
          total: products.meta?.total,
          onPageChange: (page) => setParams({ page }),
          onLimitChange: (limit) => setParams({ limit }),
        }}
        emptyTitle={hasFilters ? 'No products match your filters' : 'No products yet'}
        emptyMessage={hasFilters ? 'Try a different search or clear the filters.' : 'Add your first product to get started.'}
        emptyAction={
          !hasFilters && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog()}>
              Add Product
            </Button>
          )
        }
      />

      <ProductFormDialog
        key={dialog.key}
        open={dialog.open}
        product={dialog.product}
        categories={categories.data || []}
        onClose={closeDialog}
        onSaved={handleSaved}
      />
    </>
  );
}
