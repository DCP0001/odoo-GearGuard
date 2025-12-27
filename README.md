# GearGuard

A modern maintenance management system for tracking equipment, managing maintenance requests, and coordinating team workflows.

## Overview

GearGuard is a full-stack web application designed to streamline equipment maintenance operations. It provides a comprehensive solution for managing assets, coordinating maintenance teams, tracking service requests, and monitoring equipment health through intuitive dashboards and visual workflows.

## Features

### Core Capabilities

- **Equipment Management**: Track all your assets with detailed information including serial numbers, categories, locations, and warranty details
- **Maintenance Request System**: Create and manage corrective and preventive maintenance requests with priority levels and status tracking
- **Team Management**: Organize technicians into specialized teams and assign maintenance responsibilities
- **Kanban Board**: Visual workflow management with drag-and-drop functionality for request tracking
- **Calendar View**: Schedule and visualize preventive maintenance tasks
- **Dashboard Analytics**: Monitor key metrics including open requests, completion rates, and team performance

### Smart Features

- Role-based access control (Admin/User)
- Equipment status tracking (Active/Inactive/Scrapped)
- Maintenance history logging for all assets
- Auto-fill equipment category and team assignments
- Visual indicators for overdue requests and technician assignments
- Request workflow state transitions (New → In Progress → Repaired → Scrap)

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling with custom design tokens
- **Wouter** - Client-side routing
- **React Query** - Data fetching and state management
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations

### Backend
- **Express** - Web server
- **tRPC** - End-to-end type-safe APIs
- **Drizzle ORM** - Database toolkit
- **MySQL** - Relational database
- **Jose** - JWT authentication

### Development Tools
- **pnpm** - Package manager
- **Vitest** - Unit testing
- **Prettier** - Code formatting
- **esbuild** - Production bundling

## Prerequisites

- **Node.js** 18+ 
- **pnpm** 10+
- **MySQL** 8+

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gearguard-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL=mysql://user:password@localhost:3306/gearguard
NODE_ENV=development
```

4. Set up the database:
```bash
pnpm db:push
```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5000` (or the port specified in your environment).

### Building for Production

1. Build the application:
```bash
pnpm build
```

2. Start the production server:
```bash
pnpm start
```

## Project Structure

```
gearguard-app/
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   └── src/             # React components and pages
│       ├── components/  # Reusable UI components
│       └── pages/       # Application pages
├── server/              # Backend Express + tRPC server
│   ├── _core/           # Core server utilities
│   └── routers.ts       # API route definitions
├── shared/              # Shared types and utilities
├── drizzle/             # Database schema and migrations
│   ├── schema.ts        # Database table definitions
│   └── migrations/      # SQL migration files
└── package.json         # Project dependencies
```

## Database Schema

The application uses the following main tables:

- **users** - User authentication and profile information
- **maintenance_teams** - Teams of technicians organized by specialty
- **team_members** - Assignment of users to maintenance teams
- **equipment_categories** - Classification of assets
- **equipment** - Physical machines and devices tracked for maintenance
- **maintenance_requests** - Work orders for repairs and maintenance
- **maintenance_history** - Audit log of request changes
- **equipment_maintenance_log** - Service records for each asset

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm test` - Run unit tests
- `pnpm check` - Type check the codebase
- `pnpm format` - Format code with Prettier
- `pnpm db:push` - Generate and run database migrations

## Authentication

GearGuard uses JWT-based authentication with role-based access control:

- **Admin Role**: Full access to all features including team management and system configuration
- **User Role**: Access to create and manage maintenance requests, view equipment

## Testing

The project includes comprehensive unit tests for backend procedures:

```bash
pnpm test
```

Tests cover:
- Authentication flows
- Equipment CRUD operations
- Maintenance request workflows
- Team management
- Data validation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on the GitHub repository.
