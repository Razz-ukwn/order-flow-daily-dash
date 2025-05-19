
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

// Define user roles
export type UserRole = 'customer' | 'delivery_agent' | 'admin';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    phone: '123-456-7890',
    address: '123 Admin St'
  },
  {
    id: '2',
    name: 'Delivery Agent',
    email: 'agent@example.com',
    role: 'delivery_agent',
    phone: '234-567-8901',
    address: '456 Delivery Ave'
  },
  {
    id: '3',
    name: 'Customer User',
    email: 'customer@example.com',
    role: 'customer',
    phone: '345-678-9012',
    address: '789 Customer Blvd'
  }
];

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email (for demo)
      const foundUser = MOCK_USERS.find(u => u.email === email);
      
      if (foundUser && password === 'password') { // Simple password check for demo
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        toast({
          title: "Login successful",
          description: `Welcome back, ${foundUser.name}!`,
        });
        
        // Redirect based on role
        switch(foundUser.role) {
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
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists (for demo)
      if (MOCK_USERS.some(u => u.email === email)) {
        toast({
          title: "Registration failed",
          description: "Email already in use",
          variant: "destructive"
        });
        return;
      }
      
      // Create new user (for demo)
      const newUser: User = {
        id: String(MOCK_USERS.length + 1),
        name,
        email,
        role: 'customer', // Default role
      };
      
      // In a real app, you would save this to your backend
      // For demo, we'll just set it as the current user
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      
      navigate('/dashboard'); // Redirect to customer dashboard
    } catch (error) {
      toast({
        title: "Registration error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
