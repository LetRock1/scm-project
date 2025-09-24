// 🎯 BLOCKCHAIN SUPPLY CHAIN CONSTANTS
// Central configuration for our supply chain system

import { ProductStatus, UserRole, StatusConfig, RoleConfig } from '@/types';

// 📦 Product Status Configuration
export const STATUS_ORDER: ProductStatus[] = [
  'Created',
  'ReadyForShipping', 
  'Shipped',
  'InTransit',
  'DeliveredToRetailer',
  'AvailableForSale',
  'Sold',
  'Recalled'
];

// 🎨 Status Styling Configuration
export const STATUS_CONFIG: Record<ProductStatus, StatusConfig> = {
  Created: {
    label: 'Created',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  ReadyForShipping: {
    label: 'Ready for Shipping',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  Shipped: {
    label: 'Shipped',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  InTransit: {
    label: 'In Transit',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  DeliveredToRetailer: {
    label: 'Delivered to Retailer',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  AvailableForSale: {
    label: 'Available for Sale',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  },
  Sold: {
    label: 'Sold',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  Recalled: {
    label: 'Recalled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  }
};

// 🎭 Role Configuration
export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  manufacturer: {
    label: 'Manufacturer',
    color: 'text-manufacturer',
    gradient: 'bg-gradient-manufacturer',
    allowedStatuses: ['Created', 'ReadyForShipping']
  },
  distributor: {
    label: 'Distributor', 
    color: 'text-distributor',
    gradient: 'bg-gradient-distributor',
    allowedStatuses: ['Shipped', 'InTransit', 'DeliveredToRetailer']
  },
  retailer: {
    label: 'Retailer',
    color: 'text-retailer', 
    gradient: 'bg-gradient-retailer',
    allowedStatuses: ['AvailableForSale', 'Sold']
  },
  super_admin: {
    label: 'Super Admin',
    color: 'text-admin',
    gradient: 'bg-gradient-admin',
    allowedStatuses: STATUS_ORDER // Admin can set any status
  }
};

// Extract allowed statuses by role for easier access
export const ROLE_ALLOWED_STATUS: Record<UserRole, ProductStatus[]> = {
  manufacturer: ['Created', 'ReadyForShipping'],
  distributor: ['Shipped', 'InTransit', 'DeliveredToRetailer'],
  retailer: ['AvailableForSale', 'Sold'],
  super_admin: STATUS_ORDER
};

// 🔄 Status Transition Rules
export const NEXT_ROLE_MAP: Record<string, UserRole> = {
  ReadyForShipping: 'distributor',
  DeliveredToRetailer: 'retailer'
};

// 🛡️ Role Permissions
export const PERMISSIONS = {
  CREATE_PRODUCT: ['manufacturer'],
  UPDATE_PRODUCT: ['manufacturer', 'distributor', 'retailer'],
  DELETE_PRODUCT: ['super_admin'],
  VIEW_ALL_PRODUCTS: ['super_admin'],
  MANAGE_USERS: ['super_admin'],
  EXPORT_DATA: ['super_admin']
} as const;

// 🌍 Default Coordinates (for fallback)
export const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060 // New York City
};

// ⏱️ Timeouts and Intervals
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  GEOLOCATION: 10000, // 10 seconds
  TOAST_DURATION: 5000 // 5 seconds
} as const;

// 🎨 Animation Durations
export const ANIMATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 800
} as const;