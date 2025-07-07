# SlenoCard Landing Page

## Overview

This is a single-page React application for SlenoCard, a company that sells NFC-enabled cards for collecting Google reviews. The application is built using modern web technologies with a focus on conversion optimization and user experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **Development**: Hot module replacement and middleware mode integration with Vite

### Design System
- **Color Scheme**: Dark theme with orange accent (#FF7A00) following SlenoCard brand identity
- **Typography**: Inter font family for modern, clean appearance
- **Component Library**: Comprehensive UI component system based on Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

## Key Components

### Landing Page Sections
1. **Navigation Bar**: Fixed header with smooth scroll navigation to page sections
2. **Hero Section**: Main value proposition with call-to-action button
3. **How It Works**: Three-step process explanation with icons and descriptions
4. **Search Section**: Interactive element for business name search (visual component)
5. **Pricing Section**: Multiple pricing tiers with quantity selectors
6. **Order Form**: Lead capture form with validation
7. **Footer**: Company branding and copyright information

### Technical Components
- **Form Validation**: Zod schemas for type-safe form validation
- **Toast Notifications**: User feedback system for form submissions
- **Responsive Design**: Mobile-optimized layouts and interactions
- **Smooth Scrolling**: Enhanced navigation experience between sections

## Data Flow

### Client-Side Flow
1. User lands on single-page application
2. React Query manages any server state (currently minimal)
3. Form submissions handled locally with validation
4. Toast notifications provide user feedback
5. Smooth scroll navigation between page sections

### Server Integration
- Express server serves the React application in production
- Vite middleware provides development server with HMR
- Database schema defined for future user management
- Session handling infrastructure in place for potential user accounts

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **UI Framework**: Radix UI components, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Database**: Drizzle ORM, Neon Database serverless PostgreSQL
- **Validation**: Zod for schema validation
- **Utilities**: date-fns for date handling, clsx for conditional classes

### Development Dependencies
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast bundling for production server
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React application to optimized static files
2. **Backend Build**: ESBuild bundles Express server with external package handling
3. **Database Migration**: Drizzle handles schema migrations to PostgreSQL
4. **Asset Optimization**: Vite optimizes images, CSS, and JavaScript

### Production Configuration
- Static files served from Express server
- PostgreSQL database connection via environment variables
- Session storage in database for scalability
- Environment-based configuration for development vs production

### Development Workflow
- Hot module replacement for fast development iteration
- TypeScript checking for type safety
- Database schema push for rapid prototyping
- Integrated development server with backend proxy

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```