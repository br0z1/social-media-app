import { useEffect, useRef, useMemo, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { styled } from '@mui/material/styles';
import MapTileService from '../services/mapTileService';

interface LocationMapViewProps {
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const LocationMapViewComponent = ({ coordinates }: LocationMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  // Holds the ID of the resize timeout so it can be cleared during cleanup
  const resizeTimeoutRef = useRef<number | null>(null);

  // Default to Manhattan if no coordinates provided
  const defaultCoordinates = { lat: 40.7128, lng: -74.0060 };
  const displayCoordinates = coordinates || defaultCoordinates;
  
  // Memoize coordinates to prevent unnecessary re-renders
  const stableCoordinates = useMemo(() => ({
    lat: displayCoordinates.lat,
    lng: displayCoordinates.lng
  }), [displayCoordinates.lat, displayCoordinates.lng]);

  // Only recreate the Leaflet map when the actual coordinate numbers change
  useEffect(() => {
    const initializeMap = async () => {
      // Wait for the next frame to ensure the container is rendered
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      if (!containerRef.current) {
        return;
      }
      
      // If map is already initialized with the same coordinates, don't recreate
      if (isInitializedRef.current && mapRef.current) {
        const currentCenter = mapRef.current.getCenter();
        if (Math.abs(currentCenter.lat - stableCoordinates.lat) < 0.0001 && 
            Math.abs(currentCenter.lng - stableCoordinates.lng) < 0.0001) {
          return;
        }
      }

      try {
        // Ensure coordinates are valid numbers
        if (typeof displayCoordinates.lat !== 'number' || typeof displayCoordinates.lng !== 'number') {
          console.error('❌ Invalid coordinates:', {
            displayCoordinates,
            latType: typeof displayCoordinates.lat,
            lngType: typeof displayCoordinates.lng
          });
          return;
        }

        // Clean up any existing map
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        isInitializedRef.current = true;

        // Create map with explicit dimensions
        const map = L.map(containerRef.current as HTMLElement, {
          center: [stableCoordinates.lat, stableCoordinates.lng],
          zoom: coordinates ? 13 : 11,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          attributionControl: false,
        });

        // Add tile layer with explicit options
        const mapService = MapTileService.getInstance();
        const tileLayer = mapService.createTileLayer();
        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;

        // Add a marker at the center
        L.marker([stableCoordinates.lat, stableCoordinates.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-dot"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })
        }).addTo(map);

        mapRef.current = map;

        // Once the first tiles load, make sure the map resizes properly
        map.once('load', () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        });

        // Add error handlers
        map.on('error', (e) => {
          console.error('❌ Map error:', e);
        });

        tileLayer.on('tileerror', (e) => {
          console.error('❌ Tile error:', e);
        });

      } catch (error) {
        console.error('❌ Error initializing map:', error);
        isInitializedRef.current = false;
      }
    };

    initializeMap();

    return () => {
      // Clear any pending resize timeout (extra safety)
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('❌ Error removing map:', error);
        }
        mapRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [stableCoordinates.lat, stableCoordinates.lng]);

  // Add styles for the map container and marker
  const MapContainer = styled('div')({
    width: '100%',
    height: '100px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #8BC2A9',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    '& .leaflet-container': {
      width: '100%',
      height: '100%',
    },
    '& .custom-marker': {
      position: 'absolute',
      '& .marker-dot': {
        width: '12px',
        height: '12px',
        backgroundColor: '#8BC2A9',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 0 4px rgba(0,0,0,0.2)',
      }
    }
  });

  return <MapContainer ref={containerRef} />;
};

// Memoize the component to prevent unnecessary re-renders
export const LocationMapView = memo(LocationMapViewComponent);

export default LocationMapView; 