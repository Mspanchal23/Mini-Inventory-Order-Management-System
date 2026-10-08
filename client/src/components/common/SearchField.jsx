import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';

/** Search input that reports its value after the user stops typing. */
export default function SearchField({ value = '', onChange, placeholder = 'Search...', delay = 400, sx }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);
  const lastEmitted = useRef(value);

  // Sync when the value is changed from outside (e.g. filters reset / URL change).
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (debounced !== lastEmitted.current) {
      lastEmitted.current = debounced;
      onChange(debounced.trim());
    }
  }, [debounced, onChange]);

  return (
    <TextField
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder={placeholder}
      sx={{ minWidth: { xs: '100%', sm: 260 }, ...sx }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: text && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setText('')} aria-label="Clear search">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
