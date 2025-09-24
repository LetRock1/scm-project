// 🎯 BLOCKCHAIN SUPPLY CHAIN TYPES
// Professional type definitions for our supply chain system

export type UserRole = 'manufacturer' | 'distributor' | 'retailer' | 'super_admin';

export type ProductStatus = 
  | 'Created' 
  | 'ReadyForShipping' 
  | 'Shipped' 
  | 'InTransit' 
  | 'DeliveredToRetailer' 
  | 'AvailableForSale' 
  | 'Sold' 
  | 'Recalled';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  created_at: number;
}

export interface Product {
  product_id: string;
  name: string;
  description?: string;
  owner: string;
  custodian: string;
  current_status: ProductStatus;
  created_at: number;
  updated_at: number;
}

export interface History {
  id: number;
  product_id: string;
  status: ProductStatus;
  by_who: string;
  timestamp: number;
  latitude?: number;
  longitude?: number;
}

export interface BlockchainBlock {
  index: number;
  timestamp: number;
  data: any;
  previous_hash: string;
  hash: string;
  nonce: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface ProductHistory {
  product_details: Product;
  verified_history_timeline: History[];
  blockchain_verified: boolean;
  verification_message: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateProductRequest {
  product_id: string;
  status: ProductStatus;
  transfer_to_username?: string;
  latitude?: number;
  longitude?: number;
}

// 🎨 UI Helper Types
export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface RoleConfig {
  label: string;
  color: string;
  gradient: string;
  allowedStatuses: ProductStatus[];
}