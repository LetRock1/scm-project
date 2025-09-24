// 🏭 MANUFACTURER DASHBOARD
// Beautiful dashboard for manufacturers with production metrics

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Factory, 
  Package, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productService, blockchainService } from '@/services/api';
import { Product } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';
import { Link } from 'react-router-dom';

export const ManufacturerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getProducts({ per_page: 10 });
        setProducts(response.products);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => !['Sold', 'Recalled'].includes(p.current_status)).length;
  const readyToShip = products.filter(p => p.current_status === 'ReadyForShipping').length;
  const inProduction = products.filter(p => p.current_status === 'Created').length;

  const statsCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      description: 'Products manufactured',
      icon: Package,
      gradient: 'bg-gradient-primary',
      change: '+12%'
    },
    {
      title: 'Active in Chain',
      value: activeProducts,
      description: 'Currently in supply chain',
      icon: Zap,
      gradient: 'bg-gradient-success',
      change: '+5%'
    },
    {
      title: 'Ready to Ship',
      value: readyToShip,
      description: 'Awaiting shipment',
      icon: CheckCircle2,
      gradient: 'bg-gradient-distributor',
      change: '+8%'
    },
    {
      title: 'In Production',
      value: inProduction,
      description: 'Being manufactured',
      icon: Factory,
      gradient: 'bg-gradient-manufacturer',
      change: '+3%'
    }
  ];

  const quickActions = [
    {
      title: 'Create New Product',
      description: 'Add a new product to the blockchain',
      icon: Plus,
      href: '/products/create',
      gradient: 'bg-gradient-manufacturer',
      color: 'text-manufacturer'
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
          Welcome back, <span className="text-manufacturer">{user?.username}</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Manufacturing Excellence Dashboard - Track your production lifecycle
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass border-manufacturer/20 h-full">
            <CardHeader>
              <CardTitle className="text-manufacturer font-bold text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Streamline your manufacturing operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link to={action.href}>
                    <Card className="glass-strong border-white/10 hover:border-manufacturer/30 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`${action.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-manufacturer transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-manufacturer group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="glass border-primary/20 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary font-bold text-xl">Recent Products</CardTitle>
                <CardDescription>
                  Your latest manufactured items
                </CardDescription>
              </div>
              <Link to="/products">
                <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-muted/20 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No products yet</p>
                  <Link to="/products/create">
                    <Button className="mt-3 bg-gradient-manufacturer">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product, index) => {
                    const statusConfig = STATUS_CONFIG[product.current_status] || STATUS_CONFIG.Created;
                    return (
                      <motion.div
                        key={product.product_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg glass-strong hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {product.product_id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                          {statusConfig.label}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Blockchain Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <BlockchainHealth />
      </motion.div>
    </div>
  );
};

const BlockchainHealth: React.FC = () => {
  const [valid, setValid] = React.useState<boolean | null>(null);
  const [message, setMessage] = React.useState<string>('');
  const [lastChecked, setLastChecked] = React.useState<number>(Date.now());
  const [loading, setLoading] = React.useState<boolean>(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await blockchainService.validateChain();
      setValid(res.valid);
      setMessage(res.message);
      setLastChecked(Date.now());
    } catch (e) {
      setValid(false);
      setMessage('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Card className="glass border-success/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${valid ? 'bg-gradient-success' : 'bg-gradient-to-br from-destructive/20 to-destructive/40'} rounded-lg flex items-center justify-center`}>
              <CheckCircle2 className={`w-5 h-5 ${valid ? 'text-white' : 'text-destructive'}`} />
            </div>
            <div>
              <CardTitle className={valid ? 'text-success' : 'text-destructive'}>Blockchain Status</CardTitle>
              <CardDescription>{message || (valid ? 'Valid' : 'Invalid')}</CardDescription>
            </div>
          </div>
          <Badge className={valid ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
            <Clock className="w-3 h-3 mr-1" />
            {loading ? 'Checking...' : `Checked ${new Date(lastChecked).toLocaleTimeString()}`}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
};