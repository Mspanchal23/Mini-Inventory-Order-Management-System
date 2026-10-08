import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

const DEFAULT_OPTIONS = {
  title: 'Are you sure?',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  color: 'primary',
};

/**
 * Promise based confirmation dialog:
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Delete?', color: 'error' })) { ... }
 */
export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setOptions({ ...DEFAULT_OPTIONS, ...opts });
      }),
    [],
  );

  const close = (result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={Boolean(options)} onClose={() => close(false)} maxWidth="xs" fullWidth>
        {options && (
          <>
            <DialogTitle>{options.title}</DialogTitle>
            {options.message && (
              <DialogContent>
                <DialogContentText>{options.message}</DialogContentText>
              </DialogContent>
            )}
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => close(false)} color="inherit">
                {options.cancelText}
              </Button>
              <Button onClick={() => close(true)} variant="contained" color={options.color} autoFocus>
                {options.confirmText}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used inside ConfirmProvider');
  return context;
};
