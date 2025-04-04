import { useEffect, useRef } from 'react';
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

export const LocationMapView = ({ coordinates }: LocationMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Default to Manhattan if no coordinates provided
  const defaultCoordinates = { lat: 40.7128, lng: -74.0060 };
  const displayCoordinates = coordinates || defaultCoordinates;

  useEffect(() => {
    const initializeMap = async () => {
      if (!containerRef.current || isInitializedRef.current) {
        console.log('🚫 Map initialization skipped:', { 
          hasContainer: !!containerRef.current, 
          isInitialized: isInitializedRef.current 
        });
        return;
      }

      try {
        console.log('🗺️ Starting map initialization with:', {
          providedCoordinates: coordinates,
          usingDefault: !coordinates,
          displayCoordinates,
          containerExists: !!containerRef.current
        });
        
        // Ensure coordinates are valid numbers
        if (typeof displayCoordinates.lat !== 'number' || typeof displayCoordinates.lng !== 'number') {
          console.error('❌ Invalid coordinates:', {
            displayCoordinates,
            latType: typeof displayCoordinates.lat,
            lngType: typeof displayCoordinates.lng
          });
          return;
        }

        isInitializedRef.current = true;

        // Create map with explicit dimensions
        const map = L.map(containerRef.current as HTMLElement, {
          center: [displayCoordinates.lat, displayCoordinates.lng],
          zoom: coordinates ? 13 : 11, // Zoom out more for default location
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          attributionControl: false,
        });

        console.log('📍 Map created with center:', map.getCenter());

        // Add tile layer with explicit options
        const mapService = MapTileService.getInstance();
        const tileLayer = mapService.createTileLayer();
        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;

        console.log('🌐 Tile layer added to map');

        // Add a marker at the center
        L.marker([displayCoordinates.lat, displayCoordinates.lng], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-dot"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })
        }).addTo(map);

        mapRef.current = map;

        // Force a resize after a short delay to ensure tiles load
        setTimeout(() => {
          map.invalidateSize();
          console.log('✅ Map initialization complete:', {
            center: map.getCenter(),
            zoom: map.getZoom(),
            hasMarker: !!document.querySelector('.custom-marker')
          });
        }, 100);

      } catch (error) {
        console.error('❌ Error initializing map:', error);
        isInitializedRef.current = false;
      }
    };

    console.log('🔄 LocationMapView effect triggered with coordinates:', coordinates);
    initializeMap();

    return () => {
      if (mapRef.current) {
        console.log('🧹 Cleaning up map instance');
        mapRef.current.remove();
        mapRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [coordinates, displayCoordinates]);

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

export default LocationMapView; 