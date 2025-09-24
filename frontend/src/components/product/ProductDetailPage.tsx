import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, Users, Shield, Download, QrCode, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { productService, blockchainService, getApiBaseUrl } from '@/services/api';
import { Product, ProductHistory, BlockchainBlock } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';
import { ProductTrackingMap } from '../map/ProductTrackingMap';
import { ProductTimeline } from './ProductTimeline';
import { BlockchainExplorer } from './BlockchainExplorer';
import { ProductActions } from './ProductActions';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [productHistory, setProductHistory] = useState<ProductHistory | null>(null);
  const [blockchainBlocks, setBlockchainBlocks] = useState<BlockchainBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  

  useEffect(() => {
    if (productId) {
      loadProductData();
    }
  }, [productId]);

  const loadProductData = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      
      // Load product details and history in parallel
      const [productData, historyData, blockchainData] = await Promise.all([
        productService.getProduct(productId),
        productService.getProductHistory(productId),
        blockchainService.getProductBlockchain(productId),
      ]);

      setProduct(productData);
      setProductHistory(historyData);
      setBlockchainBlocks(blockchainData);
      setQrCodeUrl(`${getApiBaseUrl()}/api/products/${productId}/qrcode`);
      
    } catch (error) {
      console.error('Failed to load product data:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const blob = await productService.getQRCode(productId!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productId}-qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded successfully');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleExportHistory = async () => {
    try {
      const blob = await productService.exportProductHistory(productId!);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productId}-history.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('History exported successfully');
    } catch (error) {
      toast.error('Failed to export history');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !productHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested product could not be found.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[product.current_status] || STATUS_CONFIG.Created;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              <p className="text-muted-foreground">Product ID: {product.product_id}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Product Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Product Overview
              </span>
              <Badge 
                className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}
              >
                {statusConfig.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Owner</h4>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-foreground">{product.owner}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Current Custodian</h4>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-foreground">{product.custodian}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Created</h4>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-foreground">
                    {new Date(product.created_at * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            {product.description && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
                  <p className="text-foreground">{product.description}</p>
                </div>
              </>
            )}

            {/* Blockchain Verification Status */}
            <Separator />
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center">
                <Shield className={`h-5 w-5 mr-3 ${productHistory.blockchain_verified ? 'text-green-600' : 'text-red-600'}`} />
                <div>
                  <p className="font-semibold text-foreground">
                    Blockchain Status: {productHistory.blockchain_verified ? 'Verified' : 'Invalid'}
                  </p>
                  <p className="text-sm text-muted-foreground">{productHistory.verification_message}</p>
                </div>
              </div>
              <Badge variant={productHistory.blockchain_verified ? 'default' : 'destructive'}>
                {productHistory.blockchain_verified ? 'Authentic' : 'Warning'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="journey" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="journey" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Journey
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Timeline  
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journey">
            <ProductTrackingMap 
              history={productHistory.verified_history_timeline}
              productId={product.product_id}
              productName={product.name}
            />
          </TabsContent>

          <TabsContent value="timeline">
            <ProductTimeline history={productHistory.verified_history_timeline} />
          </TabsContent>

          <TabsContent value="blockchain">
            <BlockchainExplorer 
              blocks={blockchainBlocks}
              productId={product.product_id}
            />
          </TabsContent>

          <TabsContent value="actions">
            <ProductActions 
              product={product}
              onUpdate={loadProductData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};