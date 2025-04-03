import L from 'leaflet';

class MapTileService {
  private static instance: MapTileService;
  
  private constructor() {}

  public static getInstance(): MapTileService {
    if (!MapTileService.instance) {
      MapTileService.instance = new MapTileService();
    }
    return MapTileService.instance;
  }

  public createTileLayer(): L.TileLayer {
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 12,
      attribution: '© OpenStreetMap contributors',
      crossOrigin: true
    });
  }
}

export default MapTileService; 