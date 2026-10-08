import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { STATUS_COLORS } from '../../utils/constants';

/** Soft colored chip for order / product status. */
export default function StatusChip({ status, color, size = 'small', ...props }) {
  const paletteKey = color || STATUS_COLORS[status] || 'secondary';

  return (
    <Chip
      label={status}
      size={size}
      sx={(theme) => ({
        fontWeight: 600,
        color: theme.palette[paletteKey].dark,
        bgcolor: alpha(theme.palette[paletteKey].main, 0.12),
      })}
      {...props}
    />
  );
}
