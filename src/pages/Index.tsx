
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect authenticated users to their respective dashboards
    if (isAuthenticated && user) {
      switch(user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'delivery_agent':
          navigate('/delivery/dashboard');
          break;
        case 'customer':
          navigate('/dashboard');
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  return (
    <div className="min-h-screen bg-purple-100">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100 to-white pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-purple-800 mb-6">
              Daily Order Placing App
            </h1>
            <p className="text-xl md:text-2xl text-purple-700 mb-8">
              Streamlined ordering and delivery management for your daily needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-600">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-100">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-purple-800">
          Features for Everyone
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-700">For Customers</h3>
            <p className="text-gray-600">
              Browse products, place orders, and track deliveries with ease. Manage your orders and payments in one place.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-700">For Delivery Agents</h3>
            <p className="text-gray-600">
              Efficiently manage your deliveries. Get customer details, update delivery status, and track your earnings.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-purple-700">For Administrators</h3>
            <p className="text-gray-600">
              Complete control over products, orders, users, and deliveries. Generate reports and insights.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-600">
            <Link to="/register">Get Started Today</Link>
          </Button>
        </div>
      </div>
      
      {/* How it works section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-purple-800">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your account in just a few simple steps.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600">Explore our catalog and add items to your cart.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Place Order</h3>
              <p className="text-gray-600">Confirm your selections and submit your order.</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2">Receive Delivery</h3>
              <p className="text-gray-600">Track your order and receive it at your doorstep.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-purple-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Daily Orders</h3>
              <p className="text-purple-200">
                Streamlined ordering and delivery management for your daily needs.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-purple-200 hover:text-white">Log In</Link></li>
                <li><Link to="/register" className="text-purple-200 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-purple-200">
                Email: info@dailyorders.example<br />
                Phone: +1 (555) 123-4567
              </p>
            </div>
          </div>
          
          <div className="border-t border-purple-700 mt-8 pt-8 text-center text-purple-300">
            <p>&copy; 2025 Daily Orders. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
