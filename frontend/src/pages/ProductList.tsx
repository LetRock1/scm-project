// 📦 PRODUCT LIST PAGE
// Comprehensive product management interface

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Search, 
  Plus, 
  Eye, 
  QrCode,
  ArrowLeft,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { productService } from '@/services/api';
import { Product } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';
import { toast } from '@/hooks/use-toast';
 

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  

  const loadProducts = async (page = 1, search = '') => {
    setIsLoading(true);
    try {
      let response;
      if (search.trim()) {
        response = await productService.searchProducts(search);
        setProducts(response);
        setTotalPages(1);
      } else {
        // Backend already applies access control; we only filter by owner for manufacturer
        let filterParams: any = { page, per_page: 10 };
        if (user?.role === 'manufacturer') {
          filterParams.owner = user.username;
        }

        response = await productService.getProducts(filterParams);
        setProducts(response.products);
        setTotalPages(Math.ceil(response.total / response.per_page));
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: "Load Error",
        description: "Failed to load products. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      
    }
  };

  useEffect(() => {
    loadProducts(currentPage, searchQuery);
  }, [currentPage, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(1, searchQuery);
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleDownloadQR = async (product: Product) => {
    try {
      const qrBlob = await productService.getQRCode(product.product_id);
      const url = URL.createObjectURL(qrBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name}_QR.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "QR Code Downloaded",
        description: `QR code for ${product.name} downloaded successfully`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    
    try {
      await productService.deleteProduct(product.product_id);
      toast({
        title: "Product Deleted",
        description: `${product.name} has been removed from the blockchain`,
        variant: "default"
      });
      loadProducts(currentPage, searchQuery);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
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
          
          {user?.role === 'manufacturer' && (
            <Button 
              onClick={() => navigate('/products/create')}
              className="bg-gradient-manufacturer"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Product Management
          </h1>
          <p className="text-xl text-muted-foreground">
            {user?.role === 'super_admin' 
              ? 'Manage all products in the supply chain' 
              : 'Track and manage your products'
            }
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass border-primary/20">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search products by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background/50 border-white/20 focus:border-primary/50"
                  />
                </div>
                <Button type="submit" className="bg-gradient-primary">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                    loadProducts(1, '');
                  }}
                >
                  Clear
                </Button>
                
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Products ({products.length})
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Loading products...' : `Showing ${products.length} products`}
              </CardDescription>
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
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchQuery ? 'No products found' : 'No products yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search criteria'
                      : 'Create your first product to get started'
                    }
                  </p>
                  {user?.role === 'manufacturer' && !searchQuery && (
                    <Button 
                      onClick={() => navigate('/products/create')}
                      className="bg-gradient-manufacturer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Product
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-foreground">Product</TableHead>
                        <TableHead className="text-foreground">ID</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        {user?.role === 'super_admin' && (
                          <>
                            <TableHead className="text-foreground">Owner</TableHead>
                            <TableHead className="text-foreground">Custodian</TableHead>
                          </>
                        )}
                        <TableHead className="text-foreground">Created</TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => {
                        const statusConfig = STATUS_CONFIG[product.current_status] || STATUS_CONFIG.Created;
                        return (
                          <motion.tr
                            key={product.product_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium text-foreground">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {product.description || 'No description'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {product.product_id.slice(0, 12)}...
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}>
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            {user?.role === 'super_admin' && (
                              <>
                                <TableCell className="text-muted-foreground">{product.owner}</TableCell>
                                <TableCell className="text-muted-foreground">{product.custodian}</TableCell>
                              </>
                            )}
                            <TableCell className="text-muted-foreground">
                              {new Date(product.created_at * 1000).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass border-white/20">
                                  <DropdownMenuItem onClick={() => handleViewProduct(product.product_id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownloadQR(product)}>
                                    <QrCode className="w-4 h-4 mr-2" />
                                    Download QR
                                  </DropdownMenuItem>
                                  {user?.role === 'super_admin' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteProduct(product)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Product
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ProductList;