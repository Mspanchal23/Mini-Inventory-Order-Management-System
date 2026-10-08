import {
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { EmptyState, ErrorState } from './StateViews';

/**
 * Generic table used across the app.
 *
 * columns: [{ id, label, align, width, sortable, render(row) }]
 * pagination: { page, limit, total, onPageChange(page), onLimitChange(limit) } (1-based page)
 * sort: { sortBy, order, onSort(columnId) }
 */
export default function DataTable({
  columns,
  rows = [],
  loading = false,
  error,
  onRetry,
  rowKey = '_id',
  onRowClick,
  pagination,
  sort,
  emptyTitle = 'No records found',
  emptyMessage,
  emptyAction,
  size = 'medium',
  skeletonRows = 5,
  elevation,
  sx,
}) {
  const colSpan = columns.length;

  const renderBody = () => {
    if (loading && !rows.length) {
      return Array.from({ length: skeletonRows }, (_, i) => (
        <TableRow key={`skeleton-${i}`}>
          {columns.map((col) => (
            <TableCell key={col.id}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={colSpan}>
            <ErrorState message={error.message} onRetry={onRetry} />
          </TableCell>
        </TableRow>
      );
    }

    if (!rows.length) {
      return (
        <TableRow>
          <TableCell colSpan={colSpan}>
            <EmptyState title={emptyTitle} message={emptyMessage} action={emptyAction} />
          </TableCell>
        </TableRow>
      );
    }

    return rows.map((row, index) => (
      <TableRow
        key={row[rowKey] ?? index}
        hover={Boolean(onRowClick)}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        sx={{ cursor: onRowClick ? 'pointer' : 'default', '&:last-child td': { borderBottom: 0 } }}
      >
        {columns.map((col) => (
          <TableCell key={col.id} align={col.align}>
            {col.render ? col.render(row) : row[col.id]}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Paper elevation={elevation} sx={{ overflow: 'hidden', opacity: loading && rows.length ? 0.6 : 1, ...sx }}>
      <TableContainer>
        <Table size={size}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ width: col.width, whiteSpace: 'nowrap' }}
                  sortDirection={sort?.sortBy === col.id ? sort.order : false}
                >
                  {col.sortable && sort ? (
                    <TableSortLabel
                      active={sort.sortBy === col.id}
                      direction={sort.sortBy === col.id ? sort.order : 'asc'}
                      onClick={() => sort.onSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{renderBody()}</TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={Math.max((pagination.page || 1) - 1, 0)}
          rowsPerPage={pagination.limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onPageChange={(_e, page) => pagination.onPageChange(page + 1)}
          onRowsPerPageChange={(e) => pagination.onLimitChange(Number(e.target.value))}
        />
      )}
    </Paper>
  );
}
