import { Button, Paper, Stack } from '@mui/material';

/** Toolbar row above a list holding search + filters, with an optional reset button. */
export default function FilterBar({ children, onReset, showReset = false }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        {children}
        {showReset && onReset && (
          <Button onClick={onReset} color="inherit" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            Clear filters
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
