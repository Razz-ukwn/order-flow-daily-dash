
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ProfileCompletionModal from '@/components/modals/ProfileCompletionModal';
import { Loader2 } from "lucide-react";

const Register = () => {
  const { register, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Register page - Auth state:", { isAuthenticated, user, loading });
    
    if (!loading && isAuthenticated && user) {
      console.log("User is authenticated, redirecting from register page to:", user.role);
      redirectBasedOnRole(user.role);
    }
  }, [isAuthenticated, user, loading, navigate]);

  const redirectBasedOnRole = (role) => {
    console.log("Register page redirecting based on role:", role);
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
    
    console.log("Redirecting to:", targetPath);
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      navigate(targetPath, { replace: true });
    }, 100);
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    if (!password.trim()) {
      toast.error('Please enter a password');
      return false;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }
      
      console.log("Attempting registration...");
      await register(email, password, name);
      // Don't redirect here - let the useEffect handle it
      console.log("Registration successful, redirection will be handled by useEffect");
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <ProfileCompletionModal 
        isOpen={showProfileModal} 
        onClose={() => {
          setShowProfileModal(false);
          navigate('/customer/dashboard');
        }} 
      />
    </div>
  );
};

export default Register;
