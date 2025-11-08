import { useUser, useDescope } from '@descope/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, User } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user, isUserLoading } = useUser();
  const { sdk } = useDescope();

  const handleLogin = async () => {
    try {
      // Simple guest login for demo purposes
      const guestUser = {
        userId: `demo-user-${Date.now()}`,
        email: 'demo@mentoriq.com',
        name: 'Demo User'
      };
      
      // For demo, we'll just set a basic session
      // In production, you'd use proper Descope authentication
      console.log('Demo login for user:', guestUser);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Brain className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  // For demo purposes, we'll allow access without strict authentication
  // In production, you'd require proper login
  return <>{children}</>;
};

export default AuthWrapper;