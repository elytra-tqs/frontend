# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Testing
```bash
# Run Playwright E2E tests (auto-starts dev server)
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/stations.spec.ts

# Generate test report
npx playwright show-report
```

### Docker Operations
```bash
# Build development image
docker build -t elytra-frontend .

# Build production image
docker build -f Dockerfile.prod -t elytra-frontend:prod .
```

## High-Level Architecture

### Technology Stack
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Routing**: React Router DOM 7.6.0
- **State Management**: React Context API + TanStack Query 5.75.5
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS 4.1.5 with CSS variables
- **Forms**: React Hook Form 7.57.0 with Zod validation
- **API Client**: Axios 1.9.0
- **Maps**: Leaflet 1.9.4 with React Leaflet
- **Charts**: Recharts 2.15.3

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn/ui components (button, card, dialog, etc.)
│   ├── layout/         # Layout wrapper components
│   ├── navigation/     # Navigation components (breadcrumb, etc.)
│   └── stations/       # Station-specific components
├── contexts/           # Global state providers
│   ├── StationsContext.tsx  # Station data management
│   └── ChargersContext.tsx  # Charger data management
├── pages/              # Route-based page components
│   ├── Dashboard.tsx        # Public dashboard
│   ├── SignIn.tsx          # Authentication
│   ├── SignUp.tsx          # Registration
│   ├── admin/              # Admin role pages
│   ├── evdriver/           # EV Driver role pages
│   ├── manage_stations/    # Station management pages
│   └── station_operator/   # Station operator pages
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── App.tsx            # Main app component with routing
```

### Key Architectural Patterns

1. **API Integration**: All API calls proxy through `/api` to the backend at `https://stations-management:8080`

2. **Authentication**: JWT-based authentication stored in localStorage/sessionStorage

3. **Component Architecture**: 
   - shadcn/ui components use compound component pattern
   - Form components integrate React Hook Form with Zod schemas
   - Radix UI primitives provide accessibility

4. **State Management**:
   - Context API for global station/charger data
   - TanStack Query for server state and caching
   - Local component state for UI interactions

5. **Routing Structure**:
   - Public routes: /, /signin, /signup
   - Protected routes wrapped in AppLayout component
   - Role-based access to different page sections

6. **Type Safety**: 
   - Strict TypeScript configuration
   - Path aliases configured (`@/` maps to `./src/`)
   - Component props fully typed

### Development Environment

- **Dev Server**: Vite runs on http://localhost:5173
- **API Proxy**: `/api` routes forward to backend service
- **Hot Module Replacement**: Enabled for rapid development
- **ESLint**: Configured for TypeScript and React best practices
- **SonarCloud**: Code quality analysis (project key: `elytra-tqs_frontend`)