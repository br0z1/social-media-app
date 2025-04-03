import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { styled } from '@mui/material/styles';
import MapTileService from '../services/mapTileService';
import React from 'react';

const MapWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  height: '200px',
});

const MapContainer = styled('div')({
  width: '100%',
  height: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #8BC2A9',
  backgroundColor: '#f0f0f0',
});

const GreenDot = styled('div')({
  position: 'absolute',
  top: '18%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '18px',
  height: '18px',
  backgroundColor: '#8BC2A9',
  borderRadius: '50%',
  border: '3px solid white',
  boxShadow: '0 0 8px rgba(0,0,0,0.3)',
  zIndex: 999999,
});

interface LocationMapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  defaultCenter: { lat: number; lng: number };
  isVisible?: boolean;
  ref?: React.RefObject<{ getCurrentCenter: () => { lat: number; lng: number } }>;
}

export const LocationMapSelector = React.forwardRef<{ getCurrentCenter: () => { lat: number; lng: number } }, LocationMapSelectorProps>(
  ({ onLocationSelect, defaultCenter, isVisible = true }, ref) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitializedRef = useRef(false);
    const tileLayerRef = useRef<L.TileLayer | null>(null);

    // Function to get the current center coordinates
    const getCurrentCenter = () => {
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        return { lat: center.lat, lng: center.lng };
      }
      return defaultCenter;
    };

    // Expose getCurrentCenter to parent component
    React.useImperativeHandle(ref, () => ({
      getCurrentCenter
    }));

    useEffect(() => {
      const initializeMap = async () => {
        if (!containerRef.current || isInitializedRef.current) return;

        try {
          console.log('Initializing map...');
          isInitializedRef.current = true;

          // Create map with explicit dimensions
          const map = L.map(containerRef.current as HTMLElement, {
            center: [defaultCenter.lat, defaultCenter.lng],
            zoom: 13,
            zoomControl: true,
            dragging: true,
            scrollWheelZoom: true,
            attributionControl: false,
          });

          // Add tile layer with explicit options
          const mapService = MapTileService.getInstance();
          const tileLayer = mapService.createTileLayer();
          tileLayer.addTo(map);
          tileLayerRef.current = tileLayer;

          mapRef.current = map;

          // Update location when map moves
          map.on('moveend', () => {
            const center = map.getCenter();
            onLocationSelect({ lat: center.lat, lng: center.lng });
          });

          // Force a resize after a short delay to ensure tiles load
          setTimeout(() => {
            map.invalidateSize();
          }, 100);

        } catch (error) {
          console.error('Error initializing map:', error);
          isInitializedRef.current = false;
        }
      };

      if (isVisible) {
        // Small delay to ensure container is ready
        setTimeout(initializeMap, 100);
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
        isInitializedRef.current = false;
      };
    }, [isVisible]);

    return (
      <MapWrapper>
        <MapContainer ref={containerRef} />
        <GreenDot />
      </MapWrapper>
    );
  }
); 