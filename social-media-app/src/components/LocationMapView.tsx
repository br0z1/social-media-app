import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { styled } from '@mui/material/styles';
import MapTileService from '../services/mapTileService';

// Custom styled container to match post styling
const MapContainer = styled('div')({
  width: '100%',
  height: '100px',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid #8BC2A9',
  position: 'relative',
  '& .custom-marker': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
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

interface LocationMapViewProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const LocationMapView = ({ coordinates }: LocationMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!containerRef.current || isInitializedRef.current) return;

      try {
        console.log('Initializing map...');
        isInitializedRef.current = true;

        // Create map with explicit dimensions
        const map = L.map(containerRef.current as HTMLElement, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 13,
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

        mapRef.current = map;

        // Force a resize after a short delay to ensure tiles load
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

      } catch (error) {
        console.error('Error initializing map:', error);
        isInitializedRef.current = false;
      }
    };

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [coordinates]);

  return <MapContainer ref={containerRef} />;
};

export default LocationMapView; 