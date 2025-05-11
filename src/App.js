import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { useAuth } from './contexts/AuthContext';
import { CircularProgress } from '@mui/material';
import { ROLES } from './utils/roles';

 
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AccessDenied from './pages/AccessDenied';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';

 
import SupplierAnalytics from './pages/SupplierAnalytics';
import DeliveryAnalytics from './pages/DeliveryAnalytics';
import Notifications from './pages/Notifications';

 
import UserManagementPage from './pages/admin/UserManagementPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
 
import OrdersManagement from './pages/employee/OrdersManagement';
import TaskManagement from './pages/employee/TaskManagement';
import EmployeeDashboard from './pages/employee/Dashboard';
import DeliveryTracking from './pages/employee/DeliveryTracking';
import AnalyticsDashboard from './pages/employee/AnalyticsDashboard';
import SupplierManagement from './pages/employee/SupplierManagement';
 
import ReportsPage from './pages/ReportsPage';

 
import ProductManagement from './pages/supplier/ProductManagement';
import SupplierOrders from './pages/supplier/Orders';
import SupplierPerformance from './pages/supplier/SupplierPerformance';
import UnclaimedOrders from './pages/supplier/UnclaimedOrders';
import SupplierDashboard from './pages/supplier/Dashboard';
import SupplierContracts from './pages/supplier/SupplierContracts';

 
import ProductCatalog from './pages/client/ProductCatalog';
import ClientOrders from './pages/client/Orders';
import Cart from './pages/client/Cart';
import ClientDashboard from './pages/client/Dashboard';
 
import DashboardPage from './pages/admin/DashboardPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';

 
import ContractsPage from './pages/contracts/ContractsPage';

 
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

 
const RoleBasedRedirect = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role === ROLES.CLIENT) {
    return <Navigate to="/client/dashboard" replace />;
  } else if (currentUser.role === ROLES.SUPPLIER) {
    return <Navigate to="/supplier/dashboard" replace />;
  } else if (currentUser.role === ROLES.EMPLOYEE) {
    return <Navigate to="/employee/dashboard" replace />; 
  } else if (currentUser.role === ROLES.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
 
  return <Navigate to="/dashboard" replace />;
};

 
function App() {
  const { loading } = useAuth();

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: '20%' }} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{ 
          vertical: 'top', 
          horizontal: 'right' 
        }}
      >
        <Router>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            {/* Защищенные маршруты внутри Layout */}
            <Route path="/" element={<Layout />}>
              {/* Корневая страница - умное перенаправление */}
              <Route index element={<RoleBasedRedirect />} />

              {/* Общий дашборд для случаев, когда пользователь переходит напрямую на /dashboard */}
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute pageName="dashboard">
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Общие маршруты */}
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="notifications" 
                element={
                  <ProtectedRoute pageName="notifications">
                    <Notifications />
                  </ProtectedRoute>
                } 
              />

              {/* Маршруты для администратора */}
              <Route 
                path="user-management" 
                element={
                  <ProtectedRoute requiredRole="admin" pageName="user-management">
                    <UserManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="admin-reports"
                element={
                  <ProtectedRoute requiredRole={['admin', 'manager']} pageName="admin-reports">
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />

              {/* НОВЫЕ МАРШРУТЫ АДМИНИСТРАТОРА ДЛЯ BI И УПРАВЛЕНИЯ ПРОДУКТАМИ */}
              <Route 
                path="admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'manager']} pageName="admin-dashboard">
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="admin/products" 
                element={
                  <ProtectedRoute requiredRole={['admin', 'manager']} pageName="admin-products">
                    <ProductManagementPage />
                  </ProtectedRoute>
                } 
              />

              {/* Маршрут для дашборда сотрудника */}
              <Route 
                path="employee/dashboard" 
                element={
                  <ProtectedRoute requiredRole="employee" pageName="dashboard">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Новые маршруты для сотрудника */}
              <Route 
                path="employee/delivery-tracking" 
                element={
                  <ProtectedRoute requiredRole="employee" pageName="delivery-tracking">
                    <DeliveryTracking />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="employee/analytics" 
                element={
                  <ProtectedRoute requiredRole="employee" pageName="analytics">
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Маршруты для сотрудников и администраторов */}
              <Route 
                path="suppliers" 
                element={
                  <ProtectedRoute pageName="suppliers">
                    <SupplierAnalytics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="deliveries" 
                element={
                  <ProtectedRoute pageName="analytics">
                    <DeliveryAnalytics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="orders/manage" 
                element={
                  <ProtectedRoute pageName="orders">
                    <OrdersManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="employee-reports"
                element={
                  <ProtectedRoute requiredRole={['admin', 'manager', 'employee']} pageName="reports">
                    <ReportsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Новый маршрут для управления поставщиками для сотрудников */}
              <Route 
                path="suppliers/manage" 
                element={
                  <ProtectedRoute requiredRole="employee" pageName="suppliers">
                    <SupplierManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Маршруты для поставщиков */}
              <Route 
                path="supplier/dashboard" 
                element={
                  <ProtectedRoute requiredRole="supplier" pageName="dashboard">
                    <SupplierDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="products/manage" 
                element={
                  <ProtectedRoute requiredRole="supplier" pageName="products">
                    <ProductManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="supplier/orders" 
                element={
                  <ProtectedRoute requiredRole="supplier" pageName="orders">
                    <SupplierOrders />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="supplier/unclaimed-orders" 
                element={
                  <ProtectedRoute requiredRole="supplier" pageName="orders">
                    <UnclaimedOrders />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="supplier/performance" 
                element={
                  <ProtectedRoute requiredRole="supplier" pageName="performance">
                    <SupplierPerformance />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="supplier/contracts" 
                element={
                  <ProtectedRoute requiredRole="supplier" pageName="contracts">
                    <SupplierContracts />
                  </ProtectedRoute>
                } 
              />

              {/* Маршруты для клиентов */}
              <Route 
                path="client/dashboard"
                element={
                  <ProtectedRoute requiredRole="client" pageName="dashboard">
                    <ClientDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="client/products"
                element={
                  <ProtectedRoute requiredRole="client" pageName="products">
                    <ProductCatalog />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="client/orders" 
                element={
                  <ProtectedRoute requiredRole="client" pageName="orders">
                    <ClientOrders />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="client/cart"
                element={
                  <ProtectedRoute requiredRole="client" pageName="cart">
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              
              {/* Редирект со старых путей на новые */}
              <Route path="products" element={<Navigate to="/client/products" replace />} />
              <Route path="cart" element={<Navigate to="/client/cart" replace />} />

              {/* <Route 
                path="order-history" 
                element={
                  <ProtectedRoute requiredRole="client" pageName="orders">
                    <OrderHistory />
                  </ProtectedRoute>
                } 
              /> */}

              <Route 
                path="settings" 
                element={
                  <ProtectedRoute requiredRole="admin" pageName="settings">
                    <SystemSettingsPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="tasks" 
                element={
                  <ProtectedRoute requiredRole={['employee', 'admin', 'manager']} pageName="tasks">
                    <TaskManagement />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="contracts" 
                element={
                  <ProtectedRoute requiredRole="admin" pageName="contracts">
                    <ContractsPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            {/* Перенаправление неизвестных маршрутов на главную */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
