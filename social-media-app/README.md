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

## Tech Stack

### Frontend
- React + TypeScript
- Vite for build tooling
- Material-UI for components
- Leaflet for maps
- Context API for state management

### Backend
- Node.js + Express
- MongoDB for database
- Multer for file uploads
- JWT for authentication

### Infrastructure
- Netlify for frontend hosting
- Render for backend hosting
- MongoDB Atlas for database hosting

## Current Functionality

### 1. User Authentication
- User registration and login
- JWT-based session management
- Protected routes
- Profile management

### 2. Core Components

#### Navigation
- **Top Bar (Navbar)**
  - Profile icon and messages icon
  - Fixed position, light green background
  - Responsive design

- **Bottom Bar (BottomBar)**
  - "YOUR SPHERE" branding
  - Location display
  - Floating action button for post creation
  - Fixed position, light green background

#### Posts
Each post in the feed consists of:
- Image section (main content)
- Profile information and interaction bar
- Text content section (expandable if longer than 3 lines)
- Location section with interactive map
- Like and comment counters

### 3. Data Structure

#### Post Data
```typescript
{
  id: string;                    // Unique identifier
  author: {
    id: string;                  // User ID
    username: string;            // Username
    profileImage: string;        // Profile picture URL
  };
  content: string;               // Post text
  mediaFiles: Array<{           // Media files
    url: string;                // File URL
    type: 'image' | 'video';    // Media type
  }>;
  location?: {                   // Location info (optional)
    coordinates: {
      lat: number;              // Latitude
      lng: number;              // Longitude
    };
    name: string;               // Location name
  };
  likes: number;                 // Number of likes
  comments: any[];               // Comments array
  timestamp: string;             // Post creation time
}
```

### 4. Features

#### Post Creation
- Text content input
- Multiple image/video upload
- Location selection via interactive map
- Image compression for large files
- Form validation

#### Location Maps
- Interactive map for location selection
- Default to Manhattan (40.7128, -74.0060) when no location selected
- Leaflet integration with OpenStreetMap
- Custom green markers
- Non-interactive preview in posts

#### Media Handling
- Support for multiple images/videos
- Automatic image compression
- File type validation
- Secure file storage

### 5. Current Implementation Status

#### Completed
- User authentication system
- Post creation and display
- Location selection and display
- Basic media upload
- Responsive design
- Real-time feed updates

#### In Progress
- Image upload optimization
- Location data persistence
- Comment system implementation
- Like functionality
- Profile customization

#### Pending
- Real-time notifications
- Advanced search functionality
- User following system
- Direct messaging
- Advanced media editing

### 6. Technical Implementation Details

#### Map System
- **MapTileService**: Manages map tile loading and caching
- **LocationMapSelector**: Interactive map for location selection
- **LocationMapView**: Non-interactive map display in posts
- Default location handling
- Custom marker styling

#### State Management
- Context API for global state
- Local state for component-specific data
- Real-time updates through API polling

#### API Integration
- RESTful endpoints for all operations
- FormData for file uploads
- JWT authentication
- Error handling and validation

### 7. Development Environment
- Local development server
- Environment variable configuration
- TypeScript type checking
- ESLint for code quality
- Hot module replacement

## Deployment
- Frontend deployed to Netlify
- Backend deployed to Render
- MongoDB Atlas for database
- Environment-specific configuration
- Continuous deployment setup

## Future Roadmap
1. Complete media upload optimization
2. Implement comment system
3. Add like functionality
4. Enhance profile features
5. Implement real-time updates
6. Add advanced search
7. Develop messaging system
8. Add user following
9. Implement notifications
10. Add media editing tools

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
