import { Box, Divider, Paper, Stack, Typography } from '@mui/material';

/** Titled card section used on detail, form and dashboard pages. */
export default function SectionCard({ title, action, children, noPadding = false, sx }) {
  return (
    <Paper sx={{ height: '100%', ...sx }}>
      {title && (
        <>
          <Stack direction="row" sx={{ px: 2.5, py: 1.75, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {action}
          </Stack>
          <Divider />
        </>
      )}
      <Box sx={{ p: noPadding ? 0 : 2.5 }}>{children}</Box>
    </Paper>
  );
}
