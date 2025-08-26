# World Pixels - Interactive Pixel Art Canvas

## Overview

World Pixels is a collaborative pixel art application that allows users to place unlimited colored pixels on an interactive world map. The application uses a real-world geographic coordinate system where users can click anywhere on the map to place pixels of different colors and brush sizes. It's designed as a global canvas where people can create art together by placing pixels at specific latitude/longitude coordinates.

The application features a React-based frontend with an interactive Leaflet map, Express.js backend API, and PostgreSQL database for pixel storage. Users can select from a color palette, adjust brush sizes, and view statistics about pixel placements in real-time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. The architecture follows a component-based design with:

- **UI Components**: Uses shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Map Integration**: Leaflet for interactive map functionality with pixel overlay system
- **Responsive Design**: Mobile-first approach with custom hooks for device detection

### Backend Architecture
The server uses Express.js with TypeScript in ESM format:

- **API Layer**: RESTful API endpoints for pixel operations (GET, POST)
- **Storage Layer**: Abstract storage interface with in-memory implementation for development
- **Route Structure**: Modular route registration with centralized error handling
- **Middleware**: Request logging, JSON parsing, and CORS handling

### Data Storage Solutions
The application uses a hybrid approach:

- **Development**: In-memory storage with sample data initialization
- **Production**: PostgreSQL database with Drizzle ORM for type-safe queries
- **Schema**: Two main entities - users and pixels with proper indexing on coordinates
- **Database Provider**: Configured for Neon serverless PostgreSQL

### Authentication and Authorization
Currently implements anonymous pixel placement without user authentication. The schema includes user tables for future authentication features, but the current implementation allows unrestricted pixel placement with optional "placedBy" attribution.

### External Dependencies

- **Database**: PostgreSQL via Neon serverless (@neondatabase/serverless)
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Map Service**: OpenStreetMap tiles via Leaflet for the interactive map display
- **UI Library**: Radix UI primitives for accessible component building blocks
- **Validation**: Zod for runtime type validation and schema generation
- **Build Tools**: Vite for frontend bundling and ESBuild for server compilation
- **Development**: Replit-specific plugins for development environment integration

The application is designed to scale from development with in-memory storage to production with full PostgreSQL persistence while maintaining the same API interface through the storage abstraction layer.