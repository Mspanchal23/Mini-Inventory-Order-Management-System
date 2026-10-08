import { Stack, Typography } from '@mui/material';

/** Label / value pairs for detail cards. items: [{ label, value }] (empty values are skipped). */
export default function InfoList({ items }) {
  return (
    <Stack spacing={1.5}>
      {items
        .filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
        .map((item) => (
          <Stack key={item.label} spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
              {item.value}
            </Typography>
          </Stack>
        ))}
    </Stack>
  );
}
