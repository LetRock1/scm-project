// 🎯 MAIN DASHBOARD PAGE
// Role-based dashboard with beautiful stats and quick actions

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ManufacturerDashboard } from '@/components/dashboard/ManufacturerDashboard';
import { DistributorDashboard } from '@/components/dashboard/DistributorDashboard';
import { RetailerDashboard } from '@/components/dashboard/RetailerDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { UserRole } from '@/types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleComponents: Record<UserRole, React.ComponentType> = {
    manufacturer: ManufacturerDashboard,
    distributor: DistributorDashboard,
    retailer: RetailerDashboard,
    super_admin: AdminDashboard,
  };

  const DashboardComponent = roleComponents[user.role];

  return <DashboardComponent />;
};

export default Dashboard;