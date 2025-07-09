# Sphere Social Media App Structure

## Current Architecture

```plaintext
social-media-app/
├── frontend/                    # React App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Post.tsx       # Post display component
│   │   │   ├── LoadingPost.tsx # Loading state component
│   │   │   ├── Feed.tsx       # Post feed component
│   │   │   ├── BottomBar.tsx  # Location selection
│   │   │   └── Navbar.tsx     # Navigation bar
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context providers
│   │   └── types/             # TypeScript type definitions
│   └── package.json
│
└── backend/                    # Node.js/Express Server
    ├── src/
    │   ├── config/
    │   │   └── aws.ts         # AWS configuration
    │   └── services/
    │       └── database.ts    # Database service
    ├── package.json
    └── .env                   # Environment variables
```

## AWS Integration (In Progress)
- DynamoDB setup initiated
- IAM user created
- AWS SDK installed
- Environment variables configured

## Planned Components
- [ ] Database tables
- [ ] API endpoints
- [ ] Authentication system
- [ ] File upload system
- [ ] Real-time updates
- [ ] Analytics tracking

## Data Flow
```plaintext
Frontend (React) → Backend (Express) → AWS Services
    ↓                  ↓                  ↓
User Interface    API Endpoints      DynamoDB/S3
```

## Key Features
- [x] Post display
- [x] Loading states
- [x] Location selection
- [ ] Post creation
- [ ] Media upload
- [ ] User profiles
- [ ] Messaging system

## Development Status
- Frontend UI: ✅ Basic structure complete
- Backend API: 🚧 In progress
- Database: 🚧 Setting up
- Authentication: ❌ Not started
- File Storage: ❌ Not started

## Notes
- This document will be updated as development progresses
- Last updated: [Current Date] 