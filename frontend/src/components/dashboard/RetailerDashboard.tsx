// 🏪 RETAILER DASHBOARD
// Professional dashboard for retailers with sales focus

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productService } from '@/services/api';
import { Product } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';
import { Link } from 'react-router-dom';

export const RetailerDashboard: React.FC = () => {
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

  // Calculate retail statistics
  const totalProducts = products.length;
  const availableForSale = products.filter(p => p.current_status === 'AvailableForSale').length;
  const soldProducts = products.filter(p => p.current_status === 'Sold').length;
  const deliveredProducts = products.filter(p => p.current_status === 'DeliveredToRetailer').length;

  const statsCards = [
    {
      title: 'Total Inventory',
      value: totalProducts,
      description: 'Products received',
      icon: Package,
      gradient: 'bg-gradient-retailer',
      change: '+18%'
    },
    {
      title: 'Available for Sale',
      value: availableForSale,
      description: 'Ready to sell',
      icon: Store,
      gradient: 'bg-gradient-success',
      change: '+12%'
    },
    {
      title: 'Products Sold',
      value: soldProducts,
      description: 'Successfully sold',
      icon: DollarSign,
      gradient: 'bg-gradient-primary',
      change: '+25%'
    },
    {
      title: 'New Deliveries',
      value: deliveredProducts,
      description: 'Just arrived',
      icon: CheckCircle2,
      gradient: 'bg-gradient-distributor',
      change: '+8%'
    }
  ];

  const quickActions = [
    {
      title: 'Sales Management',
      description: 'Mark products as sold',
      icon: ShoppingCart,
      href: '/sales',
      gradient: 'bg-gradient-retailer',
      color: 'text-retailer'
    },
    {
      title: 'View Analytics',
      description: 'Sales performance metrics',
      icon: BarChart3,
      href: '/analytics',
      gradient: 'bg-gradient-primary',
      color: 'text-primary'
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
          Retail Central, <span className="text-retailer">{user?.username}</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Retail Operations Dashboard - Manage your sales and inventory
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
          <Card className="glass border-retailer/20 h-full">
            <CardHeader>
              <CardTitle className="text-retailer font-bold text-xl">Retail Operations</CardTitle>
              <CardDescription>
                Manage your retail business
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
                    <Card className="glass-strong border-white/10 hover:border-retailer/30 transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`${action.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-retailer transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-retailer group-hover:translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Overview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="glass border-primary/20 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary font-bold text-xl">Inventory Status</CardTitle>
                <CardDescription>
                  Current product availability
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
                  <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No products in inventory</p>
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
                          <div className="w-10 h-10 bg-gradient-retailer rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Owner: {product.owner}
                            </p>
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
      </div>

      {/* Sales Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="glass border-success/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center animate-pulse">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-success">Sales Performance</CardTitle>
                  <CardDescription>92% customer satisfaction rate</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-success/10 text-success border-success/20 mb-2">
                  Outstanding Performance
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Monthly revenue growth: +25%
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
};