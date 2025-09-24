// 🗺️ PRODUCT TRACKING MAP
// Real-time location tracking with route visualization using Leaflet + OpenStreetMap

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { History } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Route, Truck, Factory, Store } from 'lucide-react';

interface ProductTrackingMapProps {
  history: History[];
  productId: string;
  productName?: string;
}

export const ProductTrackingMap: React.FC<ProductTrackingMapProps> = ({ 
  history, 
  productId,
  productName = 'Product'
}) => {
  // Filter and process location data
  const trackingData = history
    .filter(h => h.latitude !== undefined && h.longitude !== undefined)
    .map(h => ({
      ...h,
      latitude: Number(h.latitude),
      longitude: Number(h.longitude),
    }))
    .filter(h => !Number.isNaN(h.latitude) && !Number.isNaN(h.longitude))
    .sort((a, b) => a.timestamp - b.timestamp);

  // Leaflet map refs
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const getStageColor = (status: string) => {
    if (status === 'Created') return '#3B82F6';
    if (status === 'ReadyForShipping') return '#6366F1';
    if (status === 'Shipped' || status === 'InTransit') return '#F59E0B';
    if (status === 'DeliveredToRetailer') return '#10B981';
    if (status === 'AvailableForSale' || status === 'Sold') return '#22C55E';
    return '#6B7280';
  };

  // Create custom marker icon
  const createCustomIcon = (color: string, number: number) => {
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">${number}</div>`,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  // Calculate map center and bounds
  const mapCenter: [number, number] = trackingData.length > 0 
    ? [trackingData[0].latitude, trackingData[0].longitude]
    : [51.505, -0.09]; // Default to London coordinates

  const routeCoordinates: [number, number][] = trackingData.map(point => [point.latitude, point.longitude]);

  // Only set bounds if we have multiple points
  const mapBounds = trackingData.length > 1 ? routeCoordinates : undefined;

  useEffect(() => {
    // Fix for default marker icons in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  // Initialize and update Leaflet map
  useEffect(() => {
    const container = mapDivRef.current;
    if (!container) return;

    // Create map instance once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(container, {
        center: mapCenter,
        zoom: trackingData.length === 1 ? 10 : 5,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersLayerRef.current?.clearLayers();

    // Determine route (real data only)
    const route = routeCoordinates;

    // Add markers
    route.forEach((pos, index) => {
      const [lat, lng] = pos;
      const color = trackingData.length > 0 ? getStageColor(history[index]?.status || 'Created') : '#6B7280';
      const marker = L.marker([lat, lng], { icon: createCustomIcon(color, index + 1) });
      marker.addTo(markersLayerRef.current!);
    });

    // Draw/update polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    polylineRef.current = L.polyline(route, {
      color: '#3B82F6',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
    }).addTo(map);

    // Fit view
    if (route.length > 1) {
      const bounds = L.latLngBounds(route.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (route.length === 1) {
      map.setView(route[0] as any, 10);
    }

    // Cleanup on unmount
    return () => {
      // Do not remove map here; keep instance across re-renders
    };
  }, [history, trackingData.length]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Route className="h-5 w-5 mr-2 text-primary" />
            {productName} Journey Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] w-full">
            <div ref={mapDivRef} className="h-[500px] w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Tracking Summary */}
      {trackingData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{trackingData.length}</div>
              <div className="text-sm text-muted-foreground">Tracking Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Route className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {trackingData.length > 1 ? 'Active' : 'Ready'}
              </div>
              <div className="text-sm text-muted-foreground">Journey Status</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div className="text-2xl font-bold text-foreground">Verified</div>
              <div className="text-sm text-muted-foreground">Blockchain Secured</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};