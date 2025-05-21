
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Login page - Auth state:", { isAuthenticated, user, loading });
    
    if (!loading && isAuthenticated && user) {
      console.log("User is authenticated, redirecting from login page to:", user.role);
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user, loading, navigate]);

  const redirectBasedOnRole = (role) => {
    console.log("Redirecting based on role:", role);
    let targetPath = '/customer/dashboard';
    
    switch(role) {
      case 'admin':
        targetPath = '/admin/dashboard';
        break;
      case 'delivery_agent':
        targetPath = '/delivery/dashboard';
        break;
      case 'customer':
      default:
        targetPath = '/customer/dashboard';
        break;
    }
    
    console.log("Login page redirecting to:", targetPath);
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      navigate(targetPath, { replace: true });
    }, 100);
  };

  const validateForm = () => {
    if (!email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!password.trim()) {
      toast.error('Please enter your password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      console.log("Attempting login with:", email);
      await login(email, password);
      // Login is handled by AuthContext, redirection will be handled by useEffect
      console.log("Login successful in component, waiting for redirect");
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
