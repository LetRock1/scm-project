import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  QrCode, 
  Users, 
  Settings, 
  LogOut, 
  Shield,
  Factory,
  Truck,
  Store,
  Crown,
  Plus,
  Search,
  BarChart3,
  TrendingUp,
  MapPin,
  ShoppingCart
} from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_CONFIG } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Navigation items by role
const navigationItems = {
  manufacturer: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'My Products', url: '/products', icon: Package },
    { title: 'Create Product', url: '/products/create', icon: Plus },
   // { title: 'Blockchain', url: '/blockchain', icon: Shield },
  ],
  distributor: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'My Products', url: '/products', icon: Package },
    { title: 'Supply Chain', url: '/blockchain', icon: Truck },
    { title: 'Locations', url: '/locations', icon: MapPin },
  ],
  retailer: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'My Products', url: '/products', icon: Package },
    { title: 'Store Management', url: '/store', icon: Store },
    { title: 'Sales Tracking', url: '/sales', icon: ShoppingCart },
  ],
  super_admin: [
    { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { title: 'All Products', url: '/products', icon: Package },
    { title: 'User Management', url: '/users', icon: Users },
    { title: 'Blockchain Explorer', url: '/blockchain', icon: Shield },
    { title: 'System Analytics', url: '/analytics', icon: TrendingUp },
  ],
};

const roleIcons = {
  manufacturer: Factory,
  distributor: Truck,
  retailer: Store,
  super_admin: Crown
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";
  
  if (!user) return null;

  const userRole = user.role as UserRole;
  const roleConfig = ROLE_CONFIG[userRole];
  const RoleIcon = roleIcons[userRole];
  const items = navigationItems[userRole] || [];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `group transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-r-2 border-primary shadow-primary/20' 
        : 'hover:bg-white/5 hover:text-primary/80 hover:border-r-2 hover:border-primary/30'
    }`;

  return (
    <Sidebar 
      collapsible="icon" 
      className={`${isCollapsed ? 'w-16' : 'w-72'} border-r border-primary/20 bg-card/50 backdrop-blur-xl`}
    >
      <SidebarHeader className={`${isCollapsed ? 'p-2' : 'p-6'} border-b border-primary/10`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'}`}>
          <div className={`${roleConfig.gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-glow`}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-foreground">Supply Chain</h1>
              <p className="text-xs text-muted-foreground">Blockchain Powered</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* User Profile */}
        <SidebarGroup>
          <SidebarGroupContent className="p-4">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`${roleConfig.gradient} text-white font-bold`}>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.username}
                  </p>
                  <div className="flex items-center space-x-1">
                    <RoleIcon className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {roleConfig.label}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : ''} text-muted-foreground font-medium`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'} transition-colors`} />
                      {!isCollapsed && (
                        <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary/10">
        <Button
          variant="ghost"
          onClick={logout}
          className={`${isCollapsed ? 'p-2' : 'w-full justify-start'} hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group`}
        >
          <LogOut className={`${isCollapsed ? 'h-4 w-4' : 'h-4 w-4 mr-3'} group-hover:scale-110 transition-transform`} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
        
        {!isCollapsed && (
          <div className="mt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Secured by Blockchain
            </p>
            <div className="flex justify-center mt-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
      </SidebarFooter>

    </Sidebar>
  );
}