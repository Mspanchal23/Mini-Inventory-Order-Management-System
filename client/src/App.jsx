import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from './layout/AppLayout';

// Each page is loaded on demand to keep the initial bundle small.
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderFormPage = lazy(() => import('./pages/OrderFormPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<OrderFormPage key="new" />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="orders/:id/edit" element={<OrderFormPage key="edit" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
