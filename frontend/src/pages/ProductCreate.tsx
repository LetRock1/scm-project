// 🏭 PRODUCT CREATION PAGE
// Professional form for manufacturers to create new products

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Factory, 
  QrCode, 
  CheckCircle2, 
  Loader2, 
  Download,
  ArrowLeft,
  MapPin 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productService, locationService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const loc = await locationService.getCurrentLocation();
      setCurrentLocation(loc);
    } catch (err) {
      // no-op
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { ...formData };
      if (currentLocation) {
        payload.latitude = currentLocation.latitude;
        payload.longitude = currentLocation.longitude;
      }
      const response = await productService.createProduct(payload);
      setCreatedProduct(response);
      toast({
        title: "🎉 Product Created Successfully!",
        description: `${formData.name} has been added to the blockchain`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.response?.data?.error || 'Failed to create product',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!createdProduct?.product?.product_id) return;
    
    try {
      const qrBlob = await productService.getQRCode(createdProduct.product.product_id);
      const url = URL.createObjectURL(qrBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${createdProduct.product.name}_QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setCreatedProduct(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Badge className="bg-manufacturer/10 text-manufacturer border-manufacturer/20">
            <Factory className="w-3 h-3 mr-1" />
            Manufacturer Portal
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Create New Product
          </h1>
          <p className="text-xl text-muted-foreground">
            Add a new product to the blockchain supply chain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Creation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="glass border-manufacturer/20">
              <CardHeader>
                <CardTitle className="text-manufacturer flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Product Details
                </CardTitle>
                <CardDescription>
                  Enter the information for your new product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Premium Paracetamol 500mg"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-background/50 border-white/20 focus:border-manufacturer/50"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed product description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-background/50 border-white/20 focus:border-manufacturer/50 min-h-[100px]"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-manufacturer hover:opacity-90 text-white font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Factory className="w-4 h-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Success State / QR Code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {createdProduct ? (
              <Card className="glass border-success/20">
                <CardHeader>
                  <CardTitle className="text-success flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Product Created Successfully!
                  </CardTitle>
                  <CardDescription>
                    Your product has been added to the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <h4 className="font-semibold text-success mb-2">Product Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {createdProduct.product.name}</div>
                      <div><strong>ID:</strong> {createdProduct.product.product_id}</div>
                      <div><strong>Status:</strong> {createdProduct.product.current_status}</div>
                      <div><strong>Owner:</strong> {createdProduct.product.owner}</div>
                    </div>
                  </div>

                  {createdProduct.qr_code_base64 && (
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <img 
                          src={`data:image/png;base64,${createdProduct.qr_code_base64}`}
                          alt="Product QR Code"
                          className="w-48 h-48 border rounded-lg bg-white p-4"
                        />
                      </div>
                      <Button
                        onClick={handleDownloadQR}
                        variant="outline"
                        className="border-success/30 hover:bg-success/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download QR Code
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1"
                    >
                      Create Another
                    </Button>
                    <Button
                      onClick={() => navigate(`/product/${createdProduct.product.product_id}`)}
                      className="flex-1 bg-gradient-primary"
                    >
                      View Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Product Preview
                  </CardTitle>
                  <CardDescription>
                    Your product will appear here after creation
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center text-muted-foreground">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Fill out the form to create your product</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductCreate;