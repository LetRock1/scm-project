import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Link, Clock, Hash } from 'lucide-react';
import { BlockchainBlock } from '@/types';

interface BlockchainExplorerProps {
  blocks: BlockchainBlock[];
  productId: string;
}

export const BlockchainExplorer: React.FC<BlockchainExplorerProps> = ({ 
  blocks, 
  productId 
}) => {
  const sortedBlocks = [...blocks].sort((a, b) => a.index - b.index);

  if (sortedBlocks.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Blockchain Data</h3>
            <p className="text-muted-foreground">
              No blockchain entries found for this product.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Blockchain Explorer
          </CardTitle>
          <CardDescription>
            Cryptographically secured and immutable record of all product events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{sortedBlocks.length}</div>
                <div className="text-sm text-muted-foreground">Blocks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Link className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{Math.max(0, sortedBlocks.length - 1)}</div>
                <div className="text-sm text-muted-foreground">Hash Links</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">SHA-256</div>
                <div className="text-sm text-muted-foreground">Encryption</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blockchain Blocks</CardTitle>
          <CardDescription>
            Each block is cryptographically linked to the previous one, ensuring data integrity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {sortedBlocks.map((block, index) => (
              <AccordionItem 
                key={block.index} 
                value={`block-${block.index}`}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-xs">
                        Block #{block.index}
                      </Badge>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">
                          {block.data?.type || 'Unknown Event'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(block.timestamp * 1000).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={index === sortedBlocks.length - 1 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {index === sortedBlocks.length - 1 ? 'Latest' : 'Confirmed'}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 bg-muted/20 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-2">Block Information</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span className="text-foreground">
                              {new Date(block.timestamp * 1000).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Hash className="h-3 w-3 mr-2 text-muted-foreground" />
                            <span className="text-foreground">Nonce: {block.nonce}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-2">Event Data</h5>
                        <div className="space-y-1 text-sm">
                          {block.data && typeof block.data === 'object' && Object.entries(block.data).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="text-muted-foreground capitalize mr-2">{key.replace(/_/g, ' ')}:</span>
                              <span className="text-foreground font-mono text-xs">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-muted-foreground mb-1">Current Block Hash</h5>
                        <code className="text-xs bg-background border rounded p-2 block text-foreground font-mono break-all">
                          {block.hash}
                        </code>
                      </div>
                      {block.previous_hash && (
                        <div>
                          <h5 className="text-sm font-semibold text-muted-foreground mb-1">Previous Block Hash</h5>
                          <code className="text-xs bg-background border rounded p-2 block text-foreground font-mono break-all">
                            {block.previous_hash}
                          </code>
                        </div>
                      )}
                    </div>
                    
                    {/* Hash Link Visualization */}
                    {index > 0 && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Link className="h-3 w-3" />
                          <span>Cryptographically linked to Block #{block.index - 1}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};