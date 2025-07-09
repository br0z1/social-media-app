import { useEffect, useRef, useState } from 'react';
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

// Fixed green dot that stays in the center
const GreenDot = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '18px',
  height: '18px',
  backgroundColor: '#8BC2A9',
  borderRadius: '50%',
  border: '3px solid white',
  boxShadow: '0 0 8px rgba(0,0,0,0.3)',
  zIndex: 999999,
  pointerEvents: 'none', // Ensures the dot doesn't interfere with map interaction
});

interface LocationMapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  defaultCenter: { lat: number; lng: number };
  isVisible?: boolean;
  ref?: React.RefObject<{ getCurrentCenter: () => { lat: number; lng: number } }>;
}

export const LocationMapSelector = React.memo(
  React.forwardRef<{ getCurrentCenter: () => { lat: number; lng: number } }, LocationMapSelectorProps>(
    ({ onLocationSelect, defaultCenter, isVisible = true }, ref) => {
      const mapRef = useRef<L.Map | null>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const [position, setPosition] = useState(defaultCenter);
      const initializationFlag = useRef(false);
      const [currentZoom, setCurrentZoom] = useState<number>(13); // Default zoom level

      // Function to round coordinates based on zoom level
      const roundCoordinates = (lat: number, lng: number, zoom: number): { lat: number; lng: number } => {
        // Maximum precision: 6 decimal places (about 0.11 meters at equator)
        const maxPrecision = 6;
        
        // Calculate precision based on zoom level
        let precision;
        if (zoom <= 5) precision = 0;      // World/continent view
        else if (zoom <= 8) precision = 1; // Country/state view
        else if (zoom <= 11) precision = 2; // City view
        else if (zoom <= 14) precision = 3; // Neighborhood view
        else if (zoom <= 16) precision = 4; // Street view
        else if (zoom <= 18) precision = 5; // Building view
        else precision = 6;                 // Maximum precision
        
        // Ensure we don't exceed max precision
        precision = Math.min(precision, maxPrecision);
        
        // Round coordinates to calculated precision
        const factor = Math.pow(10, precision);
        const roundedLat = Math.round(lat * factor) / factor;
        const roundedLng = Math.round(lng * factor) / factor;
        
        return {
          lat: roundedLat,
          lng: roundedLng
        };
      };

      // Update getCurrentCenter to use rounded coordinates
      React.useImperativeHandle(ref, () => ({
        getCurrentCenter: () => {
          if (mapRef.current) {
            const center = mapRef.current.getCenter();
            return roundCoordinates(center.lat, center.lng, currentZoom);
          }
          return { lat: 0, lng: 0 };
        }
      }));

      useEffect(() => {
        if (!containerRef.current || initializationFlag.current || mapRef.current) return;

        console.log('🗺️ Initializing map for the first time');
        initializationFlag.current = true;

        // Create map
        const map = L.map(containerRef.current, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: 13,
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: true,
          attributionControl: false,
        });

        // Add tile layer
        const mapService = MapTileService.getInstance();
        const tileLayer = mapService.createTileLayer();
        tileLayer.addTo(map);

        // Add moveend and zoomend event listeners
        map.on('moveend', () => {
          const center = map.getCenter();
          const newPosition = { lat: center.lat, lng: center.lng };
          setPosition(newPosition);
          onLocationSelect(newPosition);
        });

        // Add zoomend event listener
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          setCurrentZoom(zoom);
        });

        mapRef.current = map;

        // Force a resize to ensure proper rendering
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        // Cleanup
        return () => {
          console.log('🧹 Cleaning up map instance - full cleanup');
          map.remove();
          mapRef.current = null;
          initializationFlag.current = false;
        };
      }, []); // Empty dependency array since we only want to initialize once

      // Handle visibility changes
      useEffect(() => {
        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current?.invalidateSize();
          }, 100);
        }
      }, [isVisible]);

      return (
        <MapWrapper>
          <MapContainer ref={containerRef} />
          <GreenDot />
        </MapWrapper>
      );
    }
  )
);

// Add display name for debugging
LocationMapSelector.displayName = 'LocationMapSelector'; 