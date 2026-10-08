import { Avatar, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function StatCard({ label, value, icon, color = 'primary', loading = false, caption }) {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar
          variant="rounded"
          sx={(theme) => ({
            width: 48,
            height: 48,
            color: theme.palette[color].main,
            bgcolor: alpha(theme.palette[color].main, 0.12),
          })}
        >
          {icon}
        </Avatar>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" noWrap>
            {loading ? <Skeleton width={80} /> : value}
          </Typography>
          {caption && !loading && (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
