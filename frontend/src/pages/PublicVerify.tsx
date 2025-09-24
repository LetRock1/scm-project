// 🔍 PUBLIC PRODUCT VERIFICATION PAGE
// Public page for scanning QR codes and verifying product authenticity

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Calendar,
  User,
  MapPin,
  ExternalLink,
  Clock,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productService } from '@/services/api';
import { ProductHistory } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';
import { ProductTrackingMap } from '@/components/map/ProductTrackingMap';
import { ProductTimeline } from '@/components/product/ProductTimeline';

const PublicVerify: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [productData, setProductData] = useState<ProductHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number>(Date.now());
  const [lastHistoryCount, setLastHistoryCount] = useState<number>(0);

  useEffect(() => {
    const loadProductData = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await productService.getProductHistory(productId);
        setProductData(data);
        setLastUpdatedAt(Date.now());
        const newCount = data.verified_history_timeline?.length || 0;
        if (lastHistoryCount > 0 && newCount > lastHistoryCount) {
          // Optional: no toast on public page to keep clean
        }
        setLastHistoryCount(newCount);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Product not found');
      } finally {
        setIsLoading(false);
      }
    };

    let mounted = true;
    const start = async () => {
      if (!mounted) return;
      await loadProductData();
      const id = window.setInterval(loadProductData, 10000);
      return () => window.clearInterval(id);
    };
    const cleanup = start();
    return () => { mounted = false; cleanup && (cleanup as any)(); };
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-radial from-background via-background to-background/50 flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Verifying Product...</h2>
            <p className="text-muted-foreground">Checking blockchain authenticity</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen bg-gradient-radial from-background via-background to-background/50 flex items-center justify-center">
        <motion.div 
          className="text-center space-y-6 max-w-md mx-auto p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-destructive/20 to-destructive/40 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Verification Failed</h2>
            <p className="text-muted-foreground">{error || 'Product could not be found or verified'}</p>
          </div>
          <Link to="/">
            <Button className="bg-gradient-primary">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const { product_details, verified_history_timeline, blockchain_verified, verification_message } = productData;
  const statusConfig = STATUS_CONFIG[product_details.current_status] || STATUS_CONFIG.Created;

  return (
    <div className="min-h-screen bg-gradient-radial from-background via-background to-background/50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        
        {/* Verification Status Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 mb-12"
        >
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            blockchain_verified 
              ? 'bg-gradient-success shadow-success/30' 
              : 'bg-gradient-to-br from-destructive/20 to-destructive/40 shadow-destructive/30'
          } shadow-2xl`}>
            {blockchain_verified ? (
              <CheckCircle2 className="w-12 h-12 text-white" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-destructive" />
            )}
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-foreground">
              {blockchain_verified ? 'Authenticity Verified' : 'Verification Failed'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {verification_message}
            </p>
            
            {blockchain_verified && (
              <Badge className="bg-success/10 text-success border-success/20 text-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Blockchain Verified
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Product Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass border-primary/20 h-full">
              <CardHeader>
                <CardTitle className="text-primary flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">Last updated {new Date(lastUpdatedAt).toLocaleTimeString()}</div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {product_details.name}
                  </h3>
                  {product_details.description && (
                    <p className="text-muted-foreground text-sm">
                      {product_details.description}
                    </p>
                  )}
                </div>
                
                <Separator className="bg-white/10" />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Product ID</span>
                    <span className="font-mono text-foreground">
                      {product_details.product_id.slice(0, 16)}...
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Status</span>
                    <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Manufacturer</span>
                    <span className="text-foreground font-medium">{product_details.owner}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current Custodian</span>
                    <span className="text-foreground font-medium">{product_details.custodian}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">
                      {new Date(product_details.created_at * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Journey Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="glass border-primary/20 h-full">
              <CardHeader>
                <CardTitle className="text-primary flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Supply Chain Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ProductTrackingMap 
                  history={verified_history_timeline} 
                  productId={product_details.product_id}
                  productName={product_details.name}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Immutable Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductTimeline history={verified_history_timeline} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12 space-y-4"
        >
          <div className="text-muted-foreground text-sm">
            Powered by Blockchain Supply Chain Technology
          </div>
          <Link to="/auth/login">
            <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              Access Full System
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PublicVerify;