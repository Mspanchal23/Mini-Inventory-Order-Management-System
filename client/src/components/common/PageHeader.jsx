import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function PageHeader({ title, subtitle, actions, backTo, children }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ mb: 3, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        {backTo && (
          <Tooltip title="Back">
            <IconButton component={RouterLink} to={backTo} size="small" aria-label="Back">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h5" component="h1" noWrap>
              {title}
            </Typography>
            {children}
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
