import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5' },
    secondary: { main: '#64748b' },
    background: { default: '#f5f7fb', paper: '#ffffff' },
    divider: '#e5e7eb',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #e5e7eb' } },
    },
    MuiAppBar: {
      styleOverrides: { root: { border: 'none' } },
    },
    MuiDrawer: {
      styleOverrides: { paper: { border: 'none' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: '#475569', backgroundColor: '#f8fafc' },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});

export default theme;
