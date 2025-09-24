import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User } from 'lucide-react';
import { History } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';

interface ProductTimelineProps {
  history: History[];
}

export const ProductTimeline: React.FC<ProductTimelineProps> = ({ history }) => {
  const toMillis = (ts: any) => {
    if (ts == null) return Number.NaN;
    if (typeof ts === 'number') return ts > 1e12 ? ts : ts * 1000;
    const num = Number(ts);
    if (!Number.isNaN(num)) return num > 1e12 ? num : num * 1000;
    const parsed = Date.parse(String(ts));
    return Number.isNaN(parsed) ? Number.NaN : parsed;
  };
  const sortedHistory = [...history].sort((a, b) => toMillis(a.timestamp) - toMillis(b.timestamp));
  if (sortedHistory.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Timeline Data</h3>
            <p className="text-muted-foreground">
              No history entries found for this product.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Product Journey Timeline</h3>
            <Badge variant="outline" className="text-xs">
              {sortedHistory.length} Events
            </Badge>
          </div>
          
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary-glow to-muted"></div>
            
            <div className="space-y-6">
              {sortedHistory.map((event, index) => {
                const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.Created;
                const isLast = index === sortedHistory.length - 1;
                
                return (
                  <div key={`${event.id ?? index}-${event.timestamp ?? index}`} className="relative flex items-start pl-10">
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute left-0 w-8 h-8 rounded-full border-2 border-background flex items-center justify-center ${statusConfig.bgColor}`}
                    >
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Timeline Content */}
                    <div className="flex-1 min-h-16">
                      <Card className={`border-l-4 ${statusConfig.borderColor} hover:shadow-md transition-shadow`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">
                                {statusConfig.label}
                              </h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {(() => {
                                  const ms = toMillis(event.timestamp as any);
                                  if (Number.isNaN(ms)) return 'Unknown date';
                                  const date = new Date(ms);
                                  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
                                })()}
                              </div>
                            </div>
                            <Badge 
                              className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`}
                              variant="secondary"
                            >
                              {isLast ? 'Current' : `Step ${index + 1}`}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <User className="h-3 w-3 mr-2 text-muted-foreground" />
                              <span className="text-foreground font-medium">{event.by_who}</span>
                            </div>
                            
                            {event.latitude !== undefined && event.longitude !== undefined && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};