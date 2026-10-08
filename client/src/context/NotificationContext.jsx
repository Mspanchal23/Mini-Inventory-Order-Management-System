import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const value = useMemo(
    () => ({
      notify,
      success: (message) => notify(message, 'success'),
      error: (message) => notify(message, 'error'),
      info: (message) => notify(message, 'info'),
      warning: (message) => notify(message, 'warning'),
    }),
    [notify],
  );

  const handleClose = (_event, reason) => {
    if (reason !== 'clickaway') setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotify must be used inside NotificationProvider');
  return context;
};
