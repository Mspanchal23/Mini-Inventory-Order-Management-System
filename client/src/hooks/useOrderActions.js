import { useState } from 'react';
import { orderApi } from '../api';
import { useConfirm } from '../context/ConfirmContext';
import { useNotify } from '../context/NotificationContext';
import { ORDER_STATUS } from '../utils/constants';

/**
 * Confirm / cancel order actions with a confirmation dialog and toast feedback.
 * Shared by the orders list and the order details page.
 */
export default function useOrderActions(onChanged) {
  const confirm = useConfirm();
  const notify = useNotify();
  const [busyId, setBusyId] = useState(null);

  const run = async (order, dialog, request) => {
    if (!(await confirm(dialog))) return;

    setBusyId(order._id);
    try {
      const res = await request(order._id);
      notify.success(res.message);
      onChanged?.(res.data);
    } catch (error) {
      notify.error(error.message);
      // The order may have changed elsewhere (e.g. already cancelled): refresh the view.
      if ([400, 409].includes(error.status)) onChanged?.();
    } finally {
      setBusyId(null);
    }
  };

  const confirmOrder = (order) =>
    run(
      order,
      {
        title: `Confirm order ${order.orderNo}?`,
        message: 'Stock will be deducted for every item in this order.',
        confirmText: 'Confirm Order',
        color: 'success',
      },
      orderApi.confirm,
    );

  const cancelOrder = (order) =>
    run(
      order,
      {
        title: `Cancel order ${order.orderNo}?`,
        message:
          order.status === ORDER_STATUS.CONFIRMED
            ? 'This order is confirmed. Cancelling it will return all items to stock.'
            : 'This pending order will be cancelled. No stock has been deducted yet.',
        confirmText: 'Cancel Order',
        cancelText: 'Keep Order',
        color: 'error',
      },
      orderApi.cancel,
    );

  return { confirmOrder, cancelOrder, busyId };
}
