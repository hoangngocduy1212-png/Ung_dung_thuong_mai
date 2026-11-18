import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { RootLayout } from '../layouts/RootLayout';
import { AccountLayout } from '../layouts/AccountLayout';
import { SellerLayout } from '../layouts/SellerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Auth Pages (Phase 2 Baseline Preserved)
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';

// Storefront Pages (Phase 3 & 4)
import { HomePage } from '../../features/customer/HomePage';
import { CategoriesPage } from '../../features/customer/CategoriesPage';
import { ProductsPage } from '../../features/customer/ProductsPage';
import { ProductDetailPage } from '../../features/customer/ProductDetailPage';
import { ComparePage } from '../../features/customer/ComparePage';
import { PolicyPage } from '../../features/customer/PolicyPage';
import { HelpCenterPage } from '../../features/customer/HelpCenterPage';
import { ContactPage } from '../../features/customer/ContactPage';
import { CartPage } from '../../features/customer/CartPage';
import { CheckoutPage } from '../../features/customer/CheckoutPage';
import { OrderConfirmationPage } from '../../features/customer/OrderConfirmationPage';
import { OrderTrackingPage } from '../../features/customer/OrderTrackingPage';
import { PromotionsPage } from '../../features/customer/PromotionsPage';

// Customer Account Pages (Phase 5)
import { AccountOverviewPage } from '../../features/customer/AccountOverviewPage';
import { CustomerProfilePage } from '../../features/customer/CustomerProfilePage';
import { AddressBookPage } from '../../features/customer/AddressBookPage';
import { OrderHistoryPage } from '../../features/customer/OrderHistoryPage';
import { WishlistPage } from '../../features/customer/WishlistPage';
import { NotificationsPage } from '../../features/customer/NotificationsPage';

// Seller Studio Pages (Phase 6)
import { SellerDashboard } from '../../features/seller/SellerDashboard';
import { SellerProductsPage } from '../../features/seller/SellerProductsPage';
import { SellerProductFormPage } from '../../features/seller/SellerProductFormPage';
import { SellerOrdersPage } from '../../features/seller/SellerOrdersPage';
import { SellerVouchersPage } from '../../features/seller/SellerVouchersPage';
import { SellerSettingsPage } from '../../features/seller/SellerSettingsPage';
import { SellerAfterSalesPage } from '../../features/seller/SellerAfterSalesPage';

// Admin Portal Pages (Phase 7)
import { AdminDashboard } from '../../features/admin/AdminDashboard';
import { AdminShopsPage } from '../../features/admin/AdminShopsPage';
import { AdminUsersPage } from '../../features/admin/AdminUsersPage';
import { AdminCategoriesPage } from '../../features/admin/AdminCategoriesPage';
import { AdminBrandsPage } from '../../features/admin/AdminBrandsPage';
import { AdminProductsPage } from '../../features/admin/AdminProductsPage';
import { AdminOrdersPage } from '../../features/admin/AdminOrdersPage';
import { AdminVouchersPage } from '../../features/admin/AdminVouchersPage';
import { AdminStaffPage } from '../../features/admin/AdminStaffPage';
import { AdminComplaintsPage } from '../../features/admin/AdminComplaintsPage';

// CSKH Portal Pages
import { CskhDashboard } from '../../features/cskh/CskhDashboard';

// Common
import { NotFoundPage } from '../../features/common/NotFoundPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-screen Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public Storefront Layout Routes */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/orders/confirmed" element={<OrderConfirmationPage />} />
          <Route path="/checkout/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/tracking" element={<OrderTrackingPage />} />

          {/* Checkout (Customer Protected) */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Customer Account Portal (Protected) */}
        <Route
          path="/account"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AccountOverviewPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="addresses" element={<AddressBookPage />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Seller Studio (Protected) */}
        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/create" element={<SellerProductFormPage />} />
          <Route path="products/:id/edit" element={<SellerProductFormPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="vouchers" element={<SellerVouchersPage />} />
          <Route path="settings" element={<SellerSettingsPage />} />
          <Route path="after-sales" element={<SellerAfterSalesPage />} />
        </Route>

        {/* Admin Portal (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="shops" element={<AdminShopsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="complaints" element={<AdminComplaintsPage />} />
        </Route>

        {/* CSKH Portal (Protected) */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['cskh']}>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CskhDashboard />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route element={<RootLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
