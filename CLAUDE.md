# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code with ESLint
npm run lint

# Preview production build
npm run preview
```

### Testing
```bash
# Run Playwright E2E tests
npx playwright test

# Run tests with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/admin_op.spec.ts
```

## High-Level Architecture

### Frontend Tech Stack
- **React 19.1.0** with TypeScript for UI
- **Vite 6.3.5** for build tooling and dev server
- **React Router 7.6.0** for client-side routing
- **Tailwind CSS v4** with @tailwindcss/vite for styling
- **shadcn/ui** components (Radix UI primitives)
- **React Hook Form + Zod** for form handling and validation
- **TanStack Query** for server state management
- **Axios** for API requests
- **Leaflet** for interactive maps
- **Recharts** for data visualization

### Project Structure
- **src/pages/**: Route-based page components organized by user role
  - Dashboard.tsx - Main dashboard view
  - evdriver/ - EV driver specific pages
  - admin/ - Admin functionality
  - station_operator/ - Station operator features
  - manage_stations/ - Station management pages
- **src/components/**: Reusable UI components
  - ui/ - shadcn/ui base components
  - auth/ - Authentication components (AuthForm, ProtectedRoute)
  - stations/ - Station-specific components
  - navigation/ - Navigation components
- **src/contexts/**: Global state management via React Context
  - AuthContext - Authentication state and JWT token management
  - StationsContext - Station data management
  - ChargersContext - Charger state management
  - BookingsContext - Booking system state
  - CarsContext - Vehicle management
  - StationOperatorContext - Station operator specific state
- **src/lib/**: Utility functions and configurations
  - utils.ts - General utilities
  - geolocation.ts - Location services
  - mapIcons.ts - Leaflet map icon configurations

### API Integration
- All API requests proxy through `/api` (configured in vite.config.ts)
- Backend API runs on https://stations-management:8080
- JWT-based authentication with tokens stored in localStorage
- Centralized Axios configuration for consistent request handling

### Key Architectural Decisions
- **Multi-role system**: Different UI/UX for EV drivers, admin users, and station operators
- **Context-based state**: React Context API for global state instead of Redux/Zustand
- **Component library**: Using shadcn/ui for consistent, accessible UI components
- **Form validation**: Zod schemas for runtime validation with React Hook Form
- **Map integration**: Leaflet for location-based features with custom station markers
- **Real-time updates**: TanStack Query for efficient server state synchronization

### Development Configuration
- **Vite proxy**: `/api` requests forwarded to backend during development
- **TypeScript**: Strict mode enabled with path alias `@` for src directory
- **ESLint**: Configured with React hooks and refresh plugins
- **Tailwind**: Using v4 with Vite plugin integration
- **Playwright**: E2E tests configured for Chromium with automatic server startup