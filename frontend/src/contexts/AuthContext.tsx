// 🔐 AUTHENTICATION CONTEXT
// Powerful authentication management with role-based access control

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Initialize authentication state on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          // Try to get fresh user data from server
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            // Update local storage with fresh data
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch (error) {
            // If server request fails, use saved user data
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login(username, password);
      setUser(response.user);
      
      toast({
        title: "🎉 Login Successful!",
        description: `Welcome back, ${response.user.username}!`,
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast({
        title: "🚫 Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authService.register(username, password, role);
      
      toast({
        title: "✅ Registration Successful!",
        description: "Your account has been created. Please login to continue.",
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast({
        title: "🚫 Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast({
      title: "👋 Logged Out",
      description: "You have been successfully logged out.",
      variant: "default",
    });
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};