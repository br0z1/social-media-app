import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { styled } from '@mui/material/styles';
import { getNeighborhoodFromCoordinates, /* formatLocationDisplay, */ NeighborhoodInfo } from '../data/nycNeighborhoods';
import MapTileService from '../services/mapTileService';

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

const CIRCLE_RADIUS = 500; // 500 meters radius in real world
const ZOOM_THRESHOLD = 12; // Zoom level at which we switch from borough to neighborhood

const ModalContainer = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '500px', // Match width of post creation modal
  maxWidth: '90vw',
  height: '80vh',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  outline: 'none',
  overflow: 'hidden',
});

const HeaderContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '56px',
  backgroundColor: 'white',
  zIndex: 1500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
});

const MapWrapper = styled('div')({
  position: 'relative',
  width: '100%',
  height: 'calc(100% - 56px)',
  marginTop: '56px',
  border: '1px solid #ccc',
  backgroundColor: '#f0f0f0',
});

const MapContainer = styled('div')({
  width: '100%',
  height: '100%',
  backgroundColor: '#e0e0e0',
});

// Fixed green circle that stays in the center
const GreenCircle = styled('div')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%', // Smaller to ensure it's a circle
  aspectRatio: '1/1', // Force 1:1 aspect ratio
  border: '3px dashed #8BC2A9',
  borderRadius: '50%',
  boxSizing: 'border-box',
  pointerEvents: 'none', // Ensures the circle doesn't interfere with map interaction
  zIndex: 999,
});

const LocationLabel = styled(Box)({
  position: 'absolute',
  bottom: 16,
  right: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: '8px 16px',
  borderRadius: '4px',
  zIndex: 1000,
});

interface LocationSelectModalProps {
  open: boolean;
  onClose: () => void;
  onLocationSelect: (location: { displayName: string; coordinates: { center: { lat: number; lng: number }; radius: number } }) => void;
}

export default function LocationSelectModal({ open, onClose, onLocationSelect }: LocationSelectModalProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [neighborhood, setNeighborhood] = useState('');
  const [initAttempts, setInitAttempts] = useState(0);
  const currentZoomRef = useRef(13);
  const [tileWarning, setTileWarning] = useState(false);
  const [, setNeighborhoodInfo] = useState<NeighborhoodInfo | null>(null);
  

  const updateNeighborhood = useCallback(
    debounce(async (center: L.LatLng) => {
      try {
        console.log('📍 Looking up location for coordinates:', center);
        const info = await getNeighborhoodFromCoordinates({
          lat: center.lat,
          lng: center.lng
        });

        if (info) {
          setNeighborhoodInfo(info);
          if (currentZoomRef.current >= ZOOM_THRESHOLD) {
            // Show neighborhood name when zoomed in
            setNeighborhood(info.name);
          } else {
            // Show borough name when zoomed out
            setNeighborhood(info.borough.name);
          }
        } else {
          setNeighborhoodInfo(null);
          setNeighborhood('New York City');
        }
      } catch (error) {
        console.error('❌ Error looking up location:', error);
        setNeighborhoodInfo(null);
        setNeighborhood('Error getting location');
      }
    }, 1000),
    []
  );

  // Initialize the map with a delay to ensure container is ready
  const initializeMap = useCallback(() => {
    console.log('🗺️ Attempting map initialization. Container exists:', !!containerRef.current);
    
    if (!containerRef.current) {
      console.error('❌ Map container ref is not available yet');
      
      // Try again if we haven't tried too many times
      if (initAttempts < 3) {
        console.log(`⏱️ Retry attempt ${initAttempts + 1}/3 in 200ms`);
        setTimeout(() => {
          setInitAttempts(prev => prev + 1);
          initializeMap();
        }, 200);
      }
      return;
    }
    
    // Reset existing map if any
    if (mapRef.current) {
      console.log('🧹 Cleaning up existing map instance before re-init');
      mapRef.current.remove();
      mapRef.current = null;
    }

    console.log('🏗️ Creating new map instance');
    try {
      // Create map centered on NYC
      const map = L.map(containerRef.current, {
        center: [40.7128, -74.0060], // NYC coordinates
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });
      
      console.log('🌐 Map created, adding tile layer');
      
      // Add tile layer with error handling
      const mapService = MapTileService.getInstance();
      const tileLayer = mapService.createTileLayer();
      
      // Add error handling for tile loading
      tileLayer.on('tileerror', (error) => {
        console.log('⚠️ Tile loading error:', error);
        setTileWarning(true);
      });
      
      // Reset warning when tiles load successfully
      tileLayer.on('load', () => {
        setTileWarning(false);
      });
      
      tileLayer.addTo(map);
      
      console.log('🧩 Tile layer added');

      // Update neighborhood when map stops moving
      map.on('moveend', () => {
        const center = map.getCenter();
        console.log('📍 Map moved to:', center);
        updateNeighborhood(center);
      });

      // Update zoom level
      map.on('zoomend', () => {
        const zoom = map.getZoom();
        console.log('🔍 Zoom level changed to:', zoom);
        currentZoomRef.current = zoom;
        updateNeighborhood(map.getCenter());
      });
      
      // Initial update of neighborhood
      updateNeighborhood(map.getCenter());

      mapRef.current = map;

      // Force a resize to ensure proper rendering
      setTimeout(() => {
        console.log('🔄 Forcing map resize');
        map.invalidateSize();
      }, 100);
      
      console.log('✅ Map initialization complete');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
    }
  }, [initAttempts, updateNeighborhood]);

  // Initialize and clean up the map
  useEffect(() => {
    console.log('🔍 LocationSelectModal useEffect triggered. Modal open:', open);
    
    if (!open) {
      console.log('🚪 Modal is closed, skipping map initialization');
      return;
    }
    
    // Reset attempt counter when modal opens
    setInitAttempts(0);
    
    // Initialize map with a slight delay to ensure DOM is ready
    console.log('⏱️ Scheduling map initialization');
    const timer = setTimeout(() => {
      initializeMap();
    }, 300);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        console.log('🧹 Cleaning up map instance on unmount');
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [open, initializeMap]);

  const handleLocationSelect = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const radius = 5000; // 5km radius
      onLocationSelect({
        displayName: neighborhood,
        coordinates: {
          center: {
            lat: center.lat,
            lng: center.lng
          },
          radius
        }
      });
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleLocationSelect}
      aria-labelledby="modal-title"
    >
      <ModalContainer>
        <HeaderContainer>
          <Typography variant="h6" fontFamily="Kosugi">
            Choose Your Sphere
          </Typography>
          <IconButton 
            onClick={handleLocationSelect}
            size="small"
            sx={{ color: 'black' }}
          >
            <CloseIcon />
          </IconButton>
        </HeaderContainer>
        <MapWrapper>
          <MapContainer ref={containerRef} id="sphere-map-container" />
          <GreenCircle />
          <LocationLabel>
            <Typography variant="body2">{neighborhood}</Typography>
            {tileWarning && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Some map tiles may not be available at this zoom level
              </Typography>
            )}
          </LocationLabel>
        </MapWrapper>
      </ModalContainer>
    </Modal>
  );
} 