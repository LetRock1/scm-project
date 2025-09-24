// 👥 USER MANAGEMENT PAGE
// Super admin interface for managing system users

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Users, 
  Shield, 
  Factory, 
  Truck, 
  Store, 
  ArrowLeft,
  Trash2,
  UserPlus,
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
import { authService } from '@/services/api';
import { User, UserRole } from '@/types';
import { ROLE_CONFIG } from '@/utils/constants';
import { toast } from '@/hooks/use-toast';

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not super admin
  if (!hasRole(['super_admin'])) {
    navigate('/dashboard');
    return null;
  }

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getAllUsers();
      setUsers(response);
    } catch (error) {
      toast({
        title: "Load Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (username: string, cascade: boolean = false) => {
    try {
      await authService.deleteUser(username, cascade);
      toast({
        title: "User Deleted",
        description: `User ${username} has been removed from the system`,
        variant: "default"
      });
      loadUsers(); // Reload the list
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.error || 'Failed to delete user',
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      manufacturer: Factory,
      distributor: Truck,
      retailer: Store,
      super_admin: Shield
    };
    return icons[role];
  };

  const getRoleStats = () => {
    const stats = {
      manufacturer: users.filter(u => u.role === 'manufacturer').length,
      distributor: users.filter(u => u.role === 'distributor').length,
      retailer: users.filter(u => u.role === 'retailer').length,
      super_admin: users.filter(u => u.role === 'super_admin').length,
    };
    return stats;
  };

  const stats = getRoleStats();

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
          
          <Button 
            onClick={() => navigate('/auth/register')}
            className="bg-gradient-admin"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage all users in the supply chain system
          </p>
        </motion.div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(stats).map(([role, count], index) => {
            const roleConfig = ROLE_CONFIG[role as UserRole];
            const RoleIcon = getRoleIcon(role as UserRole);
            
            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass border-primary/20 hover:shadow-elegant transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                      {role.replace('_', ' ')}
                    </CardTitle>
                    <div className={`${roleConfig.gradient} w-10 h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <RoleIcon className="w-5 h-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <p className="text-xs text-muted-foreground">Active users</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Users className="w-5 h-5 mr-2" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription>
                {isLoading ? 'Loading users...' : `Showing ${users.length} users`}
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
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No users found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    There are no users in the system
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-foreground">User</TableHead>
                        <TableHead className="text-foreground">Role</TableHead>
                        <TableHead className="text-foreground">User ID</TableHead>
                        <TableHead className="text-foreground">Created</TableHead>
                        <TableHead className="text-right text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((userItem, index) => {
                        const roleConfig = ROLE_CONFIG[userItem.role];
                        const RoleIcon = getRoleIcon(userItem.role);
                        const isCurrentUser = userItem.id === user?.id;
                        
                        return (
                          <motion.tr
                            key={userItem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className={`${roleConfig.gradient} w-8 h-8 rounded-lg flex items-center justify-center`}>
                                  <RoleIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium text-foreground flex items-center">
                                    {userItem.username}
                                    {isCurrentUser && (
                                      <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${roleConfig.color} capitalize`}>
                                {userItem.role.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              #{userItem.id}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(userItem.created_at * 1000).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {!isCurrentUser && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="glass border-white/20">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                          onSelect={(e) => e.preventDefault()}
                                          className="text-destructive focus:text-destructive cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="glass border-destructive/20">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete user "{userItem.username}"? 
                                            This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(userItem.username, false)}
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            Delete User Only
                                          </AlertDialogAction>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(userItem.username, true)}
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            Delete User + Products
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;