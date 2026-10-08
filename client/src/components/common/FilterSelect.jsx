import { MenuItem, TextField } from '@mui/material';

/**
 * Select used for list filters and form fields.
 * options: array of strings or { value, label }. `allLabel` adds an "All" option with value ''.
 */
export default function FilterSelect({ label, value, onChange, options = [], allLabel, minWidth = 160, ...props }) {
  const normalized = options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt));

  return (
    <TextField
      select
      label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value, e)}
      sx={{ minWidth }}
      {...props}
    >
      {allLabel && <MenuItem value="">{allLabel}</MenuItem>}
      {normalized.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
