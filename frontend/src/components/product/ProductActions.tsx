import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, MapPin, Users, Package, Truck, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Product, ProductStatus } from '@/types';
import { productService, userService, locationService } from '@/services/api';
import { ROLE_ALLOWED_STATUS } from '@/utils/constants';

interface ProductActionsProps {
  product: Product;
  onUpdate: () => void;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ 
  product, 
  onUpdate 
}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | ''>('');
  const [transferToUser, setTransferToUser] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<{username: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);

  const canTakeAction = user && product.custodian === user.username;
  const allowedStatuses = user ? ROLE_ALLOWED_STATUS[user.role] || [] : [];

  // Status that require transfer to next role
  const transferStatuses: Record<string, string> = {
    'ReadyForShipping': 'distributor',
    'DeliveredToRetailer': 'retailer'
  };

  useEffect(() => {
    if (selectedStatus && selectedStatus in transferStatuses) {
      loadUsersForTransfer(transferStatuses[selectedStatus as keyof typeof transferStatuses]);
    }
  }, [selectedStatus]);

  useEffect(() => {
    // Auto-get location when component mounts
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      toast.success('Location detected automatically');
    } catch (error) {
      console.warn('Could not get location:', error);
      // Don't show error toast as location might not be available
    } finally {
      setLocationLoading(false);
    }
  };

  const loadUsersForTransfer = async (role: string) => {
    try {
      const users = await userService.getUsersByRole(role as any);
      setAvailableUsers(users);
    } catch (error) {
      toast.error('Failed to load available users');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !user) return;

    try {
      setLoading(true);
      
      const updateData: any = {
        product_id: product.product_id,
        status: selectedStatus,
      };

      // Add transfer user if required
      if (selectedStatus in transferStatuses && transferToUser) {
        updateData.transfer_to_username = transferToUser;
      }

      // Add location if available
      if (currentLocation) {
        updateData.latitude = currentLocation.latitude;
        updateData.longitude = currentLocation.longitude;
      }

      await productService.updateProduct(updateData);
      
      toast.success(`Product status updated to ${selectedStatus}`);
      setSelectedStatus('');
      setTransferToUser('');
      onUpdate();
      
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update product status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ProductStatus) => {
    const icons: Record<ProductStatus, React.ReactNode> = {
      'Created': <Package className="h-4 w-4" />,
      'ReadyForShipping': <Truck className="h-4 w-4" />,
      'Shipped': <Truck className="h-4 w-4" />,
      'InTransit': <Truck className="h-4 w-4" />,
      'DeliveredToRetailer': <Store className="h-4 w-4" />,
      'AvailableForSale': <Store className="h-4 w-4" />,
      'Sold': <Users className="h-4 w-4" />,
      'Recalled': <AlertCircle className="h-4 w-4" />,
    };
    return icons[status] || <Package className="h-4 w-4" />;
  };

  if (!user) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You must be logged in to perform actions on products.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canTakeAction) {
    return (
      <Card className="border-warning/20">
        <CardContent className="p-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Not Current Custodian</h3>
            <p className="text-muted-foreground mb-4">
              Only the current custodian ({product.custodian}) can perform actions on this product.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline">Your Role: {user.role}</Badge>
              <Badge variant="outline">Current Custodian: {product.custodian}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary" />
            Location Status
          </CardTitle>
          <CardDescription>
            Your current location will be automatically recorded with status updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {currentLocation ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Location Detected</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">No Location Available</p>
                  <p className="text-xs text-muted-foreground">
                    Status updates will be recorded without location data
                  </p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Detecting...' : 'Refresh Location'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Update Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Update Product Status
          </CardTitle>
          <CardDescription>
            Update the product status and transfer custody as needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {allowedStatuses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    New Status
                  </label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProductStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            {getStatusIcon(status)}
                            <span className="ml-2">{status}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStatus && selectedStatus in transferStatuses && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Transfer To ({transferStatuses[selectedStatus as keyof typeof transferStatuses]})
                    </label>
                    <Select value={transferToUser} onValueChange={setTransferToUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.username} value={user.username}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleStatusUpdate}
                disabled={
                  !selectedStatus || 
                  loading ||
                  (selectedStatus in transferStatuses && !transferToUser)
                }
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Status'}
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Your role ({user.role}) cannot perform any status updates on this product.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};