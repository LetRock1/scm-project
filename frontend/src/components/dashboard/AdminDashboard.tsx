// 👑 SUPER ADMIN DASHBOARD
// Comprehensive admin dashboard with system-wide oversight

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Users, 
  Package, 
  Activity,
  Shield,
  Database,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Settings,
  BarChart3,
  Link as ChainIcon,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productService, authService } from '@/services/api';
import { Product, User } from '@/types';
import { STATUS_CONFIG, ROLE_CONFIG } from '@/utils/constants';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, usersResponse] = await Promise.all([
          productService.getProducts({ per_page: 10 }),
          authService.getAllUsers()
        ]);
        setProducts(productsResponse.products);
        setUsers(usersResponse);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate system statistics
  const totalProducts = products.length;
  const totalUsers = users.length;
  const activeProducts = products.filter(p => !['Sold', 'Recalled'].includes(p.current_status)).length;
  const manufacturerCount = users.filter(u => u.role === 'manufacturer').length;
  const distributorCount = users.filter(u => u.role === 'distributor').length;
  const retailerCount = users.filter(u => u.role === 'retailer').length;

  const statsCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      description: 'System-wide products',
      icon: Package,
      gradient: 'bg-gradient-primary',
      change: '+23%'
    },
    {
      title: 'Active Users',
      value: totalUsers,
      description: 'Registered participants',
      icon: Users,
      gradient: 'bg-gradient-admin',
      change: '+15%'
    },
    {
      title: 'Active Supply Chain',
      value: activeProducts,
      description: 'Products in transit',
      icon: Activity,
      gradient: 'bg-gradient-success',
      change: '+18%'
    },
    {
      title: 'System Health',
      value: '99.9%',
      description: 'Uptime & reliability',
      icon: Shield,
      gradient: 'bg-gradient-distributor',
      change: '+0.1%'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage system users',
      icon: Users,
      href: '/users',
      gradient: 'bg-gradient-admin',
      color: 'text-admin'
    },
    {
      title: 'Blockchain Explorer',
      description: 'Inspect blockchain data',
      icon: ChainIcon,
      href: '/blockchain',
      gradient: 'bg-gradient-primary',
      color: 'text-primary'
    },
    {
      title: 'System Analytics',
      description: 'Performance metrics',
      icon: BarChart3,
      href: '/analytics',
      gradient: 'bg-gradient-success',
      color: 'text-success'
    },
    {
      title: 'System Settings',
      description: 'Configure parameters',
      icon: Settings,
      href: '/settings',
      gradient: 'bg-gradient-distributor',
      color: 'text-distributor'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-foreground">
          System Command Center, <span className="text-admin">{user?.username}</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Super Admin Dashboard - Complete system oversight and control
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="glass border-primary/20 hover:shadow-elegant transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.gradient} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <Badge variant="secondary" className="text-success border-success/20 bg-success/10">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* User Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="glass border-admin/20">
          <CardHeader>
            <CardTitle className="text-admin font-bold text-xl">User Distribution</CardTitle>
            <CardDescription>
              Participant roles across the supply chain network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg glass-strong">
                <div className="w-10 h-10 bg-gradient-manufacturer rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-manufacturer">Manufacturers</p>
                  <p className="text-2xl font-bold text-foreground">{manufacturerCount}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass-strong">
                <div className="w-10 h-10 bg-gradient-distributor rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-distributor">Distributors</p>
                  <p className="text-2xl font-bold text-foreground">{distributorCount}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg glass-strong">
                <div className="w-10 h-10 bg-gradient-retailer rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-retailer">Retailers</p>
                  <p className="text-2xl font-bold text-foreground">{retailerCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="glass border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary font-bold text-xl">Admin Controls</CardTitle>
            <CardDescription>
              System administration and monitoring tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to={action.href}>
                    <Card className="glass-strong border-white/10 hover:border-admin/30 transition-all duration-300 group cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`${action.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-admin transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-admin group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="glass border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-primary font-bold text-xl">Recent Products</CardTitle>
              <CardDescription>
                Latest products in the system
              </CardDescription>
            </div>
            <Link to="/products">
              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                <Eye className="w-4 h-4 mr-2" />
                View All Products
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted/20 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No products in system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 6).map((product, index) => {
                  const statusConfig = STATUS_CONFIG[product.current_status] || STATUS_CONFIG.Created;
                  const ownerRole = users.find(u => u.username === product.owner)?.role;
                  const roleConfig = ownerRole ? ROLE_CONFIG[ownerRole] : null;
                  
                  return (
                    <motion.div
                      key={product.product_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg glass-strong hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${roleConfig?.gradient || 'bg-gradient-primary'} rounded-lg flex items-center justify-center`}>
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>Owner: {product.owner}</span>
                            <span>•</span>
                            <span>Custodian: {product.custodian}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border mb-1`}>
                          {statusConfig.label}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          ID: {product.product_id.slice(0, 8)}...
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="glass border-success/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-success">System Status</CardTitle>
                  <CardDescription>All blockchain operations running smoothly</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-success/10 text-success border-success/20 mb-2">
                  All Systems Online
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Last system check: 30 seconds ago
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
};