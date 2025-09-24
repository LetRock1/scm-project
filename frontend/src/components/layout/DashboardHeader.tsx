// 🔝 PROFESSIONAL DASHBOARD HEADER
// Beautiful header with search, notifications, and user info

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  Search, 
  Bell, 
  Settings, 
  Shield, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { ROLE_CONFIG } from '@/utils/constants';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  if (!user) return null;

  const userRole = user.role as UserRole;
  const roleConfig = ROLE_CONFIG[userRole];

  // Mock blockchain status - in real app, fetch from API
  const blockchainStatus = {
    isValid: true,
    lastBlock: new Date().toLocaleTimeString(),
    totalBlocks: 1847,
    pendingTransactions: 3
  };

  return (
    <header className="h-16 border-b border-primary/10 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* 🔍 Search Section */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, users, or blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 📊 Status Indicators */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Blockchain Status */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center space-x-1 text-sm">
              <div className={`w-2 h-2 rounded-full ${blockchainStatus.isValid ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              <span className="text-muted-foreground">Blockchain</span>
              {blockchainStatus.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              )}
            </div>
          </motion.div>

          {/* Block Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>Block #{blockchainStatus.totalBlocks.toLocaleString()}</span>
          </div>

          {/* Pending Transactions */}
          {blockchainStatus.pendingTransactions > 0 && (
            <Badge variant="outline" className="border-warning/30 text-warning">
              <Clock className="w-3 h-3 mr-1" />
              {blockchainStatus.pendingTransactions} Pending
            </Badge>
          )}
        </div>

        {/* 👤 User Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Sidebar Toggle */}
          <SidebarTrigger className="hover:bg-primary/10 transition-colors duration-300" />
          
          {/* Role Badge */}
          <Badge className={`${roleConfig.gradient} text-white border-none px-3 py-1 font-medium`}>
            {roleConfig.label}
          </Badge>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-primary/10 transition-colors duration-300"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
              2
            </span>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-primary/10 transition-colors duration-300"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Security Indicator */}
          <motion.div 
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="w-4 h-4 text-success" />
            <span className="text-success text-sm font-medium">Secured</span>
          </motion.div>
        </div>
      </div>

      {/* 🌟 Gradient Border */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  );
};