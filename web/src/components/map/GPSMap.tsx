'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPoint } from '@/types';
import { LocationCoord } from '@/lib/useGeolocationTracker';
import { Crosshair, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface GPSMapProps {
  currentPosition: LocationCoord | null;
  route: GeoPoint[];
  isTracking: boolean;
  activityType?: string;
  className?: string;
}

export default function GPSMap({
  currentPosition,
  route,
  isTracking,
  activityType = 'running',
  className = '',
}: GPSMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const glowPolylineRef = useRef<L.Polyline | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [followUser, setFollowUser] = useState(true);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');

  // Fix default Leaflet icon paths in Next.js bundler
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  // Helper to create tile layer without any API key requirement
  const createTileLayer = useCallback((style: 'streets' | 'satellite' | 'dark') => {
    if (style === 'satellite') {
      return L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: '&copy; Esri World Imagery',
        }
      );
    }
    if (style === 'dark') {
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        className: 'dark-map-tiles',
        attribution: '&copy; OpenStreetMap contributors',
      });
    }
    // Default: Clean OpenStreetMap standard
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; OpenStreetMap contributors',
    });
  }, []);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Clean up any stale instances or Leaflet attributes
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if ((container as unknown as { _leaflet_id?: unknown })._leaflet_id) {
      delete (container as unknown as { _leaflet_id?: unknown })._leaflet_id;
      container.innerHTML = '';
    }

    const initialLat = currentPosition?.lat ?? 11.6643; // default or user latitude
    const initialLng = currentPosition?.lng ?? 78.1460; // default or user longitude

    const map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    // Add initial tile layer
    const initialTileLayer = createTileLayer(mapStyle);
    initialTileLayer.addTo(map);

    // Detect user manual drag to temporarily suspend auto-follow
    map.on('dragstart', () => {
      setFollowUser(false);
    });

    // Glowing outer polyline for route trail
    const glowPolyline = L.polyline([], {
      color: activityType === 'cycling' ? '#0284c7' : '#65a30d',
      weight: 9,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Sharp inner polyline
    const routePolyline = L.polyline([], {
      color: activityType === 'cycling' ? '#0284c7' : '#16a34a',
      weight: 4.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    glowPolylineRef.current = glowPolyline;
    routePolylineRef.current = routePolyline;
    mapRef.current = map;

    // ResizeObserver ensures map adjusts to any container / window changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (container) {
        container.innerHTML = '';
        delete (container as unknown as { _leaflet_id?: unknown })._leaflet_id;
      }
    };
  }, []);

  // Switch Tile Layer cleanly
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove any and all existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new layer
    const newLayer = createTileLayer(mapStyle);
    newLayer.addTo(map);
  }, [mapStyle, createTileLayer]);

  // Update Route Polyline & Start Marker
  useEffect(() => {
    if (!mapRef.current || !routePolylineRef.current || !glowPolylineRef.current) return;

    const latLngs: [number, number][] = route.map((pt) => [pt.lat, pt.lng]);
    routePolylineRef.current.setLatLngs(latLngs);
    glowPolylineRef.current.setLatLngs(latLngs);

    const strokeColor = activityType === 'cycling' ? '#0284c7' : '#16a34a';
    const glowColor = activityType === 'cycling' ? '#38bdf8' : '#84cc16';
    routePolylineRef.current.setStyle({ color: strokeColor });
    glowPolylineRef.current.setStyle({ color: glowColor });

    // Render Start Pin if route exists
    if (route.length > 0 && !startMarkerRef.current) {
      const first = route[0];
      const startIcon = L.divIcon({
        className: 'custom-start-marker',
        html: `
          <div style="background:#22c55e; border:2.5px solid #ffffff; width:14px; height:14px; border-radius:50%; box-shadow:0 0 8px rgba(34,197,94,0.9);"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([first.lat, first.lng], { icon: startIcon }).addTo(mapRef.current);
      startMarkerRef.current = marker;
    } else if (route.length === 0 && startMarkerRef.current) {
      mapRef.current.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
  }, [route, activityType]);

  // Update Current Position Marker & Auto-pan
  useEffect(() => {
    if (!mapRef.current || !currentPosition) return;

    const { lat, lng, accuracy } = currentPosition;

    // Create or move pulse marker
    if (!currentMarkerRef.current) {
      const pulseIcon = L.divIcon({
        className: 'gps-pulse-marker',
        html: `<div class="pulse-ring"></div><div class="pulse-core"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      currentMarkerRef.current = L.marker([lat, lng], {
        icon: pulseIcon,
        zIndexOffset: 1000,
      }).addTo(mapRef.current);
    } else {
      currentMarkerRef.current.setLatLng([lat, lng]);
    }

    // Accuracy Circle
    if (accuracy && accuracy < 100) {
      if (!accuracyCircleRef.current) {
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius: accuracy,
          color: '#84cc16',
          weight: 1.5,
          opacity: 0.5,
          fillColor: '#84cc16',
          fillOpacity: 0.12,
        }).addTo(mapRef.current);
      } else {
        accuracyCircleRef.current.setLatLng([lat, lng]);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    }

    // Pan map to user if follow mode is active
    if (followUser) {
      mapRef.current.panTo([lat, lng], { animate: true, duration: 0.6 });
    }
  }, [currentPosition, followUser]);

  // Map Controls
  const handleRecenter = () => {
    setFollowUser(true);
    if (mapRef.current && currentPosition) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], 16, { animate: true });
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const toggleMapStyle = () => {
    setMapStyle((prev) => (prev === 'streets' ? 'satellite' : prev === 'satellite' ? 'dark' : 'streets'));
  };

  const mapStyleLabel =
    mapStyle === 'streets' ? 'Street Map' : mapStyle === 'satellite' ? 'Satellite' : 'Dark Mode';

  return (
    <div className={`relative w-full h-full min-h-[360px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 ${className}`}>
      {/* Map Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map HUD Top Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-lg pointer-events-auto">
          <div className={`h-2.5 w-2.5 rounded-full ${isTracking ? 'bg-lime-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="text-[11px] font-bold tracking-wide uppercase text-slate-200">
            {isTracking ? 'GPS Tracking Active' : 'Live Map Ready'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={toggleMapStyle}
            title={`Switch Map Layer (Current: ${mapStyleLabel})`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-300 shadow-lg transition-colors cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-lime-400" />
            <span className="text-[11px] font-bold">{mapStyleLabel}</span>
          </button>
        </div>
      </div>

      {/* Floating Map Controls Bottom Right */}
      <div className="absolute bottom-4 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleRecenter}
          title="Recenter on current location"
          className={`p-3 rounded-2xl backdrop-blur-md border shadow-xl transition-all cursor-pointer ${
            followUser
              ? 'bg-lime-400 text-slate-950 border-lime-300 shadow-lime-400/30'
              : 'bg-slate-900/90 text-slate-200 hover:text-white border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Crosshair className="h-5 w-5" />
        </button>

        <div className="flex flex-col rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800/80 cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1.5 left-3 z-[400] text-[9px] text-slate-400/80 pointer-events-none">
        © OpenStreetMap • FitTrack AI
      </div>
    </div>
  );
}
