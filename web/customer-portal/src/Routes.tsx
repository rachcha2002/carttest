import React from 'react';
import { Routes as RouterRoutes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/order/OrderDetailPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUs from './pages/ContactUs';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import OrderSummaryPage from './pages/order/OrderSummaryPage';
import OrderSuccessPage from './pages/order/OrderSuccessPage';
import OrderFailedPage from './pages/order/OrderFailedPage';
import CartPage from './pages/order/CartPage';
import PaymentSummaryPage from './pages/payment/PaymentSummaryPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PaymentFailedPage from './pages/payment/PaymentFailedPage';

const Routes: React.FC = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="about" element={<AboutUsPage />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="orders">
          <Route
            index
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="order">
          <Route path="cart" element={<CartPage />} />
          <Route path="summary" element={<OrderSummaryPage />} />
          <Route path="success" element={<OrderSuccessPage />} />
          <Route path="failed" element={<OrderFailedPage />} />
        </Route>
        <Route path="payment">
          <Route path="" element={<PaymentSummaryPage />} />
          <Route path="success" element={<PaymentSuccessPage />} />
          <Route path="failed" element={<PaymentFailedPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes; 