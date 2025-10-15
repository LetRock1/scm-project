import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, User, Lock, Shield, Factory, Truck, Store, Crown } from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_CONFIG } from '@/utils/constants';
import { motion } from 'framer-motion';

const roleIcons = {
  manufacturer: Factory,
  distributor: Truck,
  retailer: Store,
  super_admin: Crown
};

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      // Handle password mismatch
      return;
    }
    
    if (!role) {
      // Handle no role selected
      return;
    }

    const success = await register(username, password, role as UserRole);
    if (success) {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-success/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(34,197,94,0.1),rgba(255,255,255,0))]" />
        {/* Floating Elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-12 h-12 border border-success/20 backdrop-blur-sm bg-success/5 rounded-lg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              scale: [0.5, 1, 0.5],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ 
              duration: 10,
              delay: i * 0.8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${10 + (i * 12)}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        <Card className="glass-strong border-success/20 shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <motion.div 
              className="mx-auto w-20 h-20 bg-gradient-success rounded-2xl flex items-center justify-center shadow-success"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <UserPlus className="w-10 h-10 text-white" />
            </motion.div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                Join Our Network
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Create your blockchain identity
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="username" className="text-foreground font-medium">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a unique username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 glass border-success/20 focus:border-success/40 focus:ring-success/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Role Selection */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="role" className="text-foreground font-medium">
                  Select Your Role
                </Label>
                <Select 
                  value={role} 
                  onValueChange={(value: string) => setRole(value as UserRole)} 
                  disabled={isLoading}
                >
                  <SelectTrigger className="glass border-success/20 focus:border-success/40">
                    <SelectValue placeholder="Choose your role in the supply chain" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong">
                    {Object.entries(ROLE_CONFIG).map(([roleKey, config]) => {
                      const Icon = roleIcons[roleKey as UserRole];
                      return (
                        <SelectItem key={roleKey} value={roleKey} className="hover:bg-white/5">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 ${config.gradient} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Password Field */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 glass border-success/20 focus:border-success/40 focus:ring-success/20"
                    required
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 glass border-success/20 focus:border-success/40 focus:ring-success/20"
                    required
                    disabled={isLoading}
                  />
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-destructive text-sm">Passwords do not match</p>
                )}
              </motion.div>

              {/* Register Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-success hover:shadow-success transition-all duration-300 group"
                  disabled={isLoading || !username || !password || !confirmPassword || !role || password !== confirmPassword}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Login Link */}
            <motion.div 
              className="text-center pt-4 border-t border-success/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/auth/login" 
                  className="text-success hover:text-success-glow font-medium hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>

        {/*  Security Features */}
        <motion.div 
          className="mt-8 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <p className="text-muted-foreground text-sm">Your data is secured with blockchain technology</p>
          <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
              Encrypted Storage
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Immutable Identity
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-warning rounded-full mr-2 animate-pulse" />
              Tamper Proof
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};