// 🔗 BLOCKCHAIN EXPLORER PAGE
// Beautiful blockchain dashboard with real-time data

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { blockchainService } from '@/services/api';
import { BlockchainBlock } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Clock, Hash, Database, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlockchainExplorer } from '@/components/product/BlockchainExplorer';

const Blockchain: React.FC = () => {
  const { user } = useAuth();
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blockchainStats, setBlockchainStats] = useState({
    totalBlocks: 0,
    totalTransactions: 0,
    averageBlockTime: '12s',
    networkHealth: 100
  });

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    try {
      setIsLoading(true);
      // Mock blockchain data - in real app, fetch from blockchain service
      const mockBlocks: BlockchainBlock[] = [
        {
          index: 0,
          timestamp: Date.now(),
          data: { event_type: 'Created', status: 'Created', location: 'Factory A' },
          previous_hash: '0x0000000000...',
          hash: '0x1a2b3c4d5e6f...',
          nonce: 12345
        },
        {
          index: 1,
          timestamp: Date.now() - 86400000,
          data: { event_type: 'Shipped', status: 'Shipped', location: 'Distribution Center' },
          previous_hash: '0x1a2b3c4d5e6f...',
          hash: '0x2b3c4d5e6f1a...',
          nonce: 67890
        }
      ];
      
      setBlocks(mockBlocks);
      setBlockchainStats({
        totalBlocks: 1247,
        totalTransactions: 3891,
        averageBlockTime: '8.2s',
        networkHealth: 99.8
      });
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Blocks',
      value: blockchainStats.totalBlocks.toLocaleString(),
      icon: Database,
      color: 'text-blue-600',
      gradient: 'from-blue-600 to-blue-400'
    },
    {
      title: 'Transactions',
      value: blockchainStats.totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'text-green-600',
      gradient: 'from-green-600 to-green-400'
    },
    {
      title: 'Avg Block Time',
      value: blockchainStats.averageBlockTime,
      icon: Clock,
      color: 'text-purple-600',
      gradient: 'from-purple-600 to-purple-400'
    },
    {
      title: 'Network Health',
      value: `${blockchainStats.networkHealth}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      gradient: 'from-orange-600 to-orange-400'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blockchain Explorer</h1>
            <p className="text-muted-foreground">
              {user?.role === 'super_admin' ? 'System-wide blockchain overview' : 'Your blockchain activity'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs defaultValue="explorer" className="space-y-6">
          <TabsList>
            <TabsTrigger value="explorer">Block Explorer</TabsTrigger>
            <TabsTrigger value="network">Network Status</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="explorer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Recent Blocks
                </CardTitle>
                <CardDescription>
                  Latest blockchain entries across the supply chain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainExplorer blocks={blocks} productId="sample-1" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Status</CardTitle>
                <CardDescription>Real-time blockchain network health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <span className="font-medium">Network Status</span>
                  </div>
                  <Badge variant="secondary">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Latest Block Height</span>
                  <span className="text-primary font-mono">#1,247</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="font-medium">Hash Rate</span>
                  <span className="text-primary font-mono">2.4 TH/s</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">
                    Advanced analytics and reporting features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Blockchain;