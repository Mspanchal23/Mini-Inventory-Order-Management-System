import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';

/** Dialog wrapper with a <form>, error banner and submit/cancel buttons. */
export default function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  submitting = false,
  submitLabel = 'Save',
  error,
  maxWidth = 'sm',
  children,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit, noValidate: true } }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        {title}
        <IconButton
          onClick={onClose}
          disabled={submitting}
          sx={{ position: 'absolute', right: 12, top: 12 }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
