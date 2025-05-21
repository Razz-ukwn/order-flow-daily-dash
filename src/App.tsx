
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth, UserRole } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { SettingsProvider } from "./contexts/SettingsContext";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Customer pages
import CustomerLayout from "./components/layouts/CustomerLayout";
import CustomerDashboard from "./pages/customer/Dashboard";
import ProductsPage from "./pages/customer/Products";

// Delivery agent pages
import DeliveryAgentLayout from "./components/layouts/DeliveryAgentLayout";
import DeliveryDashboard from "./pages/delivery/Dashboard";

// Admin pages
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  console.log("ProtectedRoute - Current user:", user);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Is authenticated:", isAuthenticated);
  console.log("ProtectedRoute - Is loading:", isLoading);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    console.log("ProtectedRoute - User not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }
  
  if (user && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute - User role not allowed:", user.role);
    console.log("ProtectedRoute - Redirecting based on role");
    // Redirect based on role
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'delivery_agent':
        return <Navigate to="/delivery/dashboard" />;
      case 'customer':
        return <Navigate to="/customer/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }
  
  console.log("ProtectedRoute - Access granted");
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Customer routes */}
    <Route path="/customer" element={
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerLayout />
      </ProtectedRoute>
    }>
      <Route path="dashboard" element={<CustomerDashboard />} />
      <Route path="products" element={<ProductsPage />} />
      <Route path="orders" element={<div>My Orders</div>} />
      <Route path="orders/:id" element={<div>Order Details</div>} />
      <Route path="profile" element={<div>Profile</div>} />
    </Route>
    
    {/* Delivery agent routes */}
    <Route path="/delivery" element={
      <ProtectedRoute allowedRoles={['delivery_agent']}>
        <DeliveryAgentLayout />
      </ProtectedRoute>
    }>
      <Route path="dashboard" element={<DeliveryDashboard />} />
      <Route path="deliveries/today" element={<div>Today's Deliveries</div>} />
      <Route path="deliveries/:id" element={<div>Delivery Details</div>} />
      <Route path="history" element={<div>Delivery History</div>} />
      <Route path="profile" element={<div>Profile</div>} />
    </Route>
    
    {/* Admin routes */}
    <Route path="/admin" element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    }>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="orders/:id" element={<div>Order Details</div>} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="profile" element={<AdminProfile />} />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
              <DataProvider>
                <AppRoutes />
              </DataProvider>
            </SettingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
