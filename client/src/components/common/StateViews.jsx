import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import InboxIcon from '@mui/icons-material/Inbox';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';

/** Shared empty / error / loading placeholders used by pages and tables. */

export function EmptyState({ icon = <InboxIcon />, title = 'Nothing here yet', message, action }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', py: 6, px: 2, textAlign: 'center', color: 'text.secondary' }}>
      <Box sx={{ '& svg': { fontSize: 48, color: 'text.disabled' } }}>{icon}</Box>
      <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {message && <Typography variant="body2">{message}</Typography>}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <EmptyState
      icon={<ErrorOutlineIcon color="error" />}
      title="Could not load data"
      message={message}
      action={
        onRetry && (
          <Button variant="outlined" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}

export function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
      <CircularProgress />
    </Box>
  );
}
