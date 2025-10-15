import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User } from 'lucide-react';
import { History } from '@/types';
import { STATUS_CONFIG } from '@/utils/constants';

interface ProductTimelineProps {
  history: History[]; // history array from either product.to_dict(include_history=true) OR /history endpoint
}

export const ProductTimeline: React.FC<ProductTimelineProps> = ({ history }) => {
  const toMillis = (ts: any) => {
    if (ts == null) return Number.NaN;
    // Sometimes ts is already milliseconds (large), sometimes seconds (smaller), sometimes string
    if (typeof ts === 'number') return ts > 1e12 ? ts : ts * 1000;
    const num = Number(ts);
    if (!Number.isNaN(num)) return num > 1e12 ? num : num * 1000;
    const parsed = Date.parse(String(ts));
    return Number.isNaN(parsed) ? Number.NaN : parsed;
  };

  // normalize incoming history items so UI can rely on consistent keys
  const normalized = (history || []).map((ev: any, i) => ({
    // keep original fields but add normalized aliases
    ...ev,
    actor: ev.by_who || ev.by || ev.actor || ev.username || 'Unknown',
    ts: ev.timestamp ?? ev.time ?? ev.ts ?? ev.block_timestamp ?? null,
    latitude: ev.latitude ?? ev.lat ?? null,
    longitude: ev.longitude ?? ev.lon ?? null,
    __idx: i
  }));

  const sortedHistory = [...normalized].sort((a, b) => {
    const am = toMillis(a.ts);
    const bm = toMillis(b.ts);
    if (Number.isNaN(am) && Number.isNaN(bm)) return a.__idx - b.__idx;
    if (Number.isNaN(am)) return 1;
    if (Number.isNaN(bm)) return -1;
    return am - bm;
  });

  if (sortedHistory.length === 0) {
    return (
      <Card className="border-2 border-dashed border-border">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Timeline Data</h3>
            <p className="text-muted-foreground">No history entries found for this product.</p>
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
            <Badge variant="outline" className="text-xs">{sortedHistory.length} Events</Badge>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary-glow to-muted"></div>

            <div className="space-y-6">
              {sortedHistory.map((event: any, index: number) => {
                const statusKey = event.status || event.action || 'Created';
                const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Created;
                const isLast = index === sortedHistory.length - 1;

                const ms = toMillis(event.ts);
                const dateLabel = Number.isNaN(ms) ? 'Unknown date' : new Date(ms).toLocaleString();

                return (
                  <div key={`${event.product_id ?? ''}-${event.__idx}-${index}`} className="relative flex items-start pl-10">
                    <div className={`absolute left-0 w-8 h-8 rounded-full border-2 border-background flex items-center justify-center ${statusConfig.bgColor}`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-h-16">
                      <Card className={`border-l-4 ${statusConfig.borderColor} hover:shadow-md transition-shadow`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{statusConfig.label || statusKey}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {dateLabel}
                              </div>
                            </div>
                            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`} variant="secondary">
                              {isLast ? 'Current' : `Step ${index + 1}`}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <User className="h-3 w-3 mr-2 text-muted-foreground" />
                              <span className="text-foreground font-medium">{event.actor}</span>
                            </div>

                            {event.latitude != null && event.longitude != null && (
                              <div className="flex items-center text-sm">
                                <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {Number(event.latitude).toFixed(4)}, {Number(event.longitude).toFixed(4)}
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