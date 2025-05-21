
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define user roles
export type UserRole = 'customer' | 'delivery_agent' | 'admin';

// Define user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: string;
  profile_pic?: string;
  profile_completed: boolean;
  created_at: string;
  address?: string;
  user_id: string; // Added to match the interface
}

// Auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from Supabase
  useEffect(() => {
    console.log("AuthProvider initializing");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, !!currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log("Session user found, fetching profile...");
          await fetchUserProfile(currentSession.user);
        } else {
          console.log("No session user, clearing state");
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Got existing session:", currentSession ? "yes" : "no");
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log("Existing session user found, fetching profile...");
          await fetchUserProfile(currentSession.user);
        } else {
          console.log("No existing session, clearing state");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
    return () => subscription.unsubscribe();
  }, []);

  // Function to generate unique user ID
  const generateUserId = async (): Promise<string> => {
    try {
      const { data: latestUser, error } = await supabase
        .from('users')
        .select('user_id')
        .order('user_id', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNumber = 1;
      if (latestUser && latestUser.length > 0) {
        const lastNumber = parseInt(latestUser[0].user_id.replace('AP', ''));
        nextNumber = lastNumber + 1;
      }

      return `AP${nextNumber.toString().padStart(5, '0')}`;
    } catch (error) {
      console.error('Error generating user ID:', error);
      throw error;
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    console.log("Starting fetchUserProfile for user:", supabaseUser.id);
    setIsLoading(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.error('No profile found for user:', supabaseUser.id);
        throw new Error('User profile not found');
      }

      console.log("Profile fetched successfully:", profile);

      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role as UserRole,
        phone: profile.phone,
        location: profile.location,
        profile_pic: profile.profile_pic,
        profile_completed: profile.profile_completed,
        created_at: profile.created_at,
        address: profile.address,
        user_id: profile.user_id
      };

      console.log("Setting user data:", userData);
      setUser(userData);

      // Handle redirections if on auth pages
      const currentPath = location.pathname;
      console.log("Current path:", currentPath, "User role:", userData.role);
      if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
        console.log("User is on auth page, redirecting to dashboard");
        redirectBasedOnRole(userData.role);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUser(null);
      toast.error("Failed to load user profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect based on user role
  const redirectBasedOnRole = (role: UserRole) => {
    console.log(`Attempting to redirect user with role: ${role}`);
    
    let path = '/customer/dashboard';
    switch(role) {
      case 'admin':
        path = '/admin/dashboard';
        break;
      case 'delivery_agent':
        path = '/delivery/dashboard';
        break;
      case 'customer':
      default:
        path = '/customer/dashboard';
        break;
    }
    
    console.log(`Redirecting to: ${path}`);
    navigate(path, { replace: true });
  };

  // Login function
  const login = async (email: string, password: string) => {
    console.log("Starting login process for:", email);
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (!data.user) {
        console.error("No user data returned");
        throw new Error('No user data returned');
      }

      console.log("Login successful, user:", data.user.id);
      
      toast.success("Login successful", {
        description: "Welcome back!"
      });

      // Let the auth state change handler handle the profile fetch and redirection
      return;
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : 'An error occurred during login'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate unique user ID
      const userId = await generateUserId();

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'customer',
            user_id: userId
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('No user data returned from registration');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email,
            name,
            role: 'customer',
            user_id: userId,
            profile_completed: false,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) throw profileError;

      console.log("Registration successful, profile created");
      
      toast.success("Registration successful", {
        description: "Your account has been created"
      });

      // Auth state change listener will handle the redirect
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during registration');
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : 'An error occurred during registration'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success("Logged out", {
        description: "You have been successfully logged out"
      });
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Logout failed", {
        description: "Failed to log out"
      });
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      if (!authUser) {
        setUser(null);
        return;
      }

      await fetchUserProfile(authUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError('Failed to refresh user data');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading: isLoading, 
        error,
        isAuthenticated: !!user,
        isLoading, 
        login, 
        register, 
        logout, 
        refreshUser 
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
