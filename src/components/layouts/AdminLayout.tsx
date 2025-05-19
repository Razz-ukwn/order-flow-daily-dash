
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users,
  User,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/products', label: 'Products', icon: ShoppingCart },
    { path: '/admin/orders', label: 'Orders', icon: Package },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
    { path: '/admin/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-purple-400 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/admin/dashboard" className="text-xl font-bold">Daily Orders</Link>
          
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm font-medium">
                Hello, {user?.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout} 
                className="text-white hover:bg-purple-500"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
            
            <button 
              className="md:hidden text-white"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <div className="bg-white h-full w-3/4 max-w-sm p-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-purple-700">Menu</h2>
              <button onClick={toggleMobileMenu}>
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center p-3 rounded-md ${
                    isActive(item.path)
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              
              <button
                onClick={() => {
                  logout();
                  toggleMobileMenu();
                }}
                className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r">
          <div className="p-4">
            <div className="bg-purple-100 rounded-full p-4 mb-2 mx-auto w-16 h-16 flex items-center justify-center">
              <User className="h-8 w-8 text-purple-700" />
            </div>
            <div className="text-center mb-6">
              <h3 className="font-medium">{user?.name}</h3>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md ${
                      isActive(item.path)
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
