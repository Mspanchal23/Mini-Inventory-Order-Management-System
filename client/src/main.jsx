import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ConfirmProvider } from './context/ConfirmContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';
import theme from './theme';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NotificationProvider>
          <ConfirmProvider>
            <App />
          </ConfirmProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
