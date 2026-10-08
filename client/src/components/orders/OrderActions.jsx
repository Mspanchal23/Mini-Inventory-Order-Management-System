import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ORDER_STATUS } from '../../utils/constants';

/**
 * Edit / Confirm / Cancel controls for an order, shown only when the action is allowed.
 * variant="icons" for table rows, "buttons" for the details page header.
 */
export default function OrderActions({ order, actions, variant = 'icons' }) {
  const { confirmOrder, cancelOrder, busyId } = actions;
  const busy = busyId === order._id;
  const isPending = order.status === ORDER_STATUS.PENDING;
  const canCancel = isPending || order.status === ORDER_STATUS.CONFIRMED;

  const items = [
    isPending && {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlinedIcon fontSize="small" />,
      linkTo: `/orders/${order._id}/edit`,
      buttonVariant: 'outlined',
      color: 'inherit',
    },
    canCancel && {
      key: 'cancel',
      label: 'Cancel Order',
      icon: <BlockIcon fontSize="small" />,
      onClick: () => cancelOrder(order),
      buttonVariant: 'outlined',
      color: 'error',
    },
    isPending && {
      key: 'confirm',
      label: 'Confirm Order',
      icon: <CheckCircleOutlineIcon fontSize="small" />,
      onClick: () => confirmOrder(order),
      buttonVariant: 'contained',
      color: 'success',
    },
  ].filter(Boolean);

  if (!items.length) return null;

  // Keep clicks inside the actions from triggering the table row click.
  const stop = (event) => event.stopPropagation();
  const linkProps = (item) => (item.linkTo ? { component: RouterLink, to: item.linkTo } : { onClick: item.onClick });

  if (variant === 'buttons') {
    return (
      <Stack direction="row" spacing={1} onClick={stop}>
        {items.map((item) => (
          <Button
            key={item.key}
            variant={item.buttonVariant}
            color={item.color}
            startIcon={busy && item.onClick ? <CircularProgress size={16} color="inherit" /> : item.icon}
            disabled={busy}
            {...linkProps(item)}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} onClick={stop} sx={{ justifyContent: 'flex-end' }}>
      {items.map((item) => (
        <Tooltip key={item.key} title={item.label}>
          <span>
            <IconButton
              size="small"
              color={item.color === 'inherit' ? 'default' : item.color}
              disabled={busy}
              aria-label={item.label}
              {...linkProps(item)}
            >
              {item.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Stack>
  );
}
