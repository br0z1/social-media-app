# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# Your Sphere - Social Media App Documentation

## Overview
Your Sphere is a social media app that focuses on location-based content sharing. Users can create posts with images, text, and location information, creating a geographically connected social experience.

## App Structure

### 1. Core Components

#### Navigation
- **Top Bar (Navbar)**
  - Located at the top of the screen
  - Contains profile icon (left) and messages icon (right)
  - Fixed position, light green background

- **Bottom Bar (BottomBar)**
  - Located at the bottom of the screen
  - Shows "YOUR SPHERE" on the left and location (e.g., "BEDSTUY, BK") on the right
  - Has a floating circular button in the center
  - Fixed position, light green background

#### Posts
Each post in the feed consists of:
- Image section (main content)
- Profile information and interaction bar (overlaid on image bottom)
- Text content section (expandable if longer than 3 lines)
- Location section with interactive map

### 2. Data Structure

#### Post Data
Each post contains:
```typescript
{
  id: string;                    // Unique identifier
  author: {
    id: string;                  // User ID
    username: string;            // Username
    profileImage: string;        // Profile picture URL
  };
  content?: string;              // Post text (optional)
  image?: string;                // Post image URL (optional)
  likes: number;                 // Number of likes
  comments: number;              // Number of comments
  location?: {                   // Location info (optional)
    coordinates: {
      lat: number;              // Latitude
      lng: number;              // Longitude
    };
    name: string;               // Location name
  };
  timestamp: string;             // Post creation time
}
```

### 3. Special Features

#### Location Maps
- Each post can include a location map
- Maps are powered by OpenStreetMap through Leaflet
- Maps show a small, non-interactive preview in the post
- Custom green pin marks the exact location
- Maps are pre-cached for NYC area to improve loading speed

#### Text Management
- Post text is limited to 3 lines by default
- "See more" button appears for longer text
- Clicking expands to show full text

### 4. Styling
- Fonts:
  - Main text: Urbanist Light (300 weight)
  - Location text and bottom bar: Kosugi
- Colors:
  - Primary green: #8BC2A9 (used for borders and accents)
  - Navigation bars: #BEFFE1
- Dimensions:
  - Posts: 80% of viewport height
  - Map preview: 120px height
  - All corners rounded: 14px radius

### 5. Current Data Management
- Currently using mock data stored locally
- Data structure prepared for future backend integration
- Images will be stored separately from text data
- Location data integrated with mapping system

### 6. Technical Implementation Details

#### Map System
The map system consists of two main parts:
1. **MapTileService**: 
   - Manages map tile loading and caching
   - Pre-downloads map tiles for NYC area
   - Creates individual tile layers for each map

2. **LocationMapView**:
   - Renders individual map instances
   - Handles map initialization and cleanup
   - Creates custom location markers

#### Component Communication
- Components use TypeScript interfaces for type safety
- Data flows from parent to child components
- Each component handles its own state management

### 7. Future Considerations
- Backend integration for data persistence
- User authentication system
- Real-time location updates
- Interactive map features
- Image upload and storage
- Comment system implementation

## Development Notes
- Built with React + TypeScript
- Uses Material-UI for components
- Leaflet for maps
- Responsive design principles
- Mobile-first approach
