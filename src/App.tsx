import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { POSProvider } from './context/POSContext';
import { usePOS } from './hooks/usePOS';
import { MainLayout } from './layouts/MainLayout';
import { POSPage } from './pages/POSPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { RecipesPage } from './pages/RecipesPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UserRole } from './types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { currentUser, authReady } = usePOS();

  if (!authReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;

  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  return (
    <POSProvider>
      <Router>
        <Routes>
          {/* Guest / Public */}
          <Route path="/" element={<PublicRoute><POSPage /></PublicRoute>} />
          <Route path="/recipes" element={<PublicRoute><RecipesPage /></PublicRoute>} />

          {/* Owner + Karyawan */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'karyawan']}><DashboardPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute allowedRoles={['owner', 'karyawan']}><InventoryPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute allowedRoles={['owner', 'karyawan']}><TransactionsPage /></ProtectedRoute>} />

          {/* Owner Only */}
          <Route path="/products" element={<ProtectedRoute allowedRoles={['owner']}><ProductsPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute allowedRoles={['owner']}><CategoriesPage /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute allowedRoles={['owner']}><PurchasesPage /></ProtectedRoute>} />
          <Route path="/employees" element={<ProtectedRoute allowedRoles={['owner']}><EmployeesPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['owner']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['owner']}><SettingsPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </POSProvider>
  );
}