# FleetFlow — Fleet Management & Analytics Platform

> A full-stack fleet management system for managing vehicles, drivers, trips, maintenance records, and fuel usage — with operational analytics via a dashboard.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Getting Started](#4-getting-started)
5. [Backend Architecture](#5-backend-architecture)
6. [Data Model](#6-data-model)
7. [Workflow State Model](#7-workflow-state-model)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Frontend Architecture](#9-frontend-architecture)
10. [API Reference](#10-api-reference)
11. [Business Logic Layer](#11-business-logic-layer)
12. [Analytics](#12-analytics)
13. [Validation & Error Handling](#13-validation--error-handling)
14. [Design Philosophy](#14-design-philosophy)
15. [Future Improvements](#15-future-improvements)

---

## 1. Project Overview

FleetFlow is a full-stack fleet management system built with Node.js, Express, Prisma, PostgreSQL on the backend, and React + Vite + Zustand on the frontend.

The system follows a **modular backend architecture** with a React-based frontend dashboard, ensuring clear separation between UI, business logic, and data storage. **The frontend never interacts with the database directly** — all operations flow through the backend API.

### Core Capabilities

- Vehicle lifecycle management — track status, capacity, and assignments
- Driver management — licensing, duty status, and trip assignments
- Trip dispatch — full `DRAFT → DISPATCHED` workflow with safety validations
- Maintenance logs — link service records to fleet vehicles
- Fuel logs — record fuel usage per vehicle
- Operational analytics — server-side computed insights for the dashboard

---

## 2. Architecture Overview

FleetFlow follows a classic **three-tier client–server architecture**:

```
Frontend (React + Zustand + Axios)
            │
            ▼
Backend API (Express + Prisma)
            │
            ▼
     PostgreSQL Database
```

### Key Design Principles

- The **frontend** is a pure client — it renders data and calls APIs only
- The **backend** is the sole layer that communicates with the database
- **Business logic** is centralized entirely within the service layer
- **Prisma ORM** manages all database interactions with type safety
- **Role-based access control** protects all API routes

### Request Lifecycle

```
User action (React UI)
      │
      ▼  Axios request with JWT
      │
      ▼  Express Auth Middleware
      │
      ▼  Route Handler
      │
      ▼  Controller  (parses, validates, responds)
      │
      ▼  Service Layer  (business rules + transactions)
      │
      ▼  Prisma ORM
      │
      ▼  PostgreSQL
      │
      ▼  { success, message, data }
```

---

## 3. Technology Stack

### Backend

| Package / Tool | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express | HTTP server and middleware framework |
| Prisma ORM | Type-safe database access layer |
| PostgreSQL | Relational database |
| Zod | Schema validation for request inputs |
| jsonwebtoken | Stateless authentication tokens |
| bcrypt | Secure password hashing |

### Frontend

| Package / Tool | Purpose |
|---|---|
| React | Component-based UI framework |
| Vite | Fast development build tool |
| Zustand | Lightweight global state management |
| Axios | Promise-based HTTP client with interceptors |

---

## 4. Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- npm or yarn

### Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fleetflow"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### Backend Setup

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed

# Start the development server
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API requests to the backend.

---

## 5. Backend Architecture

The backend is organized using **feature-based modules**. Each module encapsulates all logic for a specific domain entity and follows a strict layered architecture:

```
Routes → Controllers → Services → Prisma
```

### Modules

| Module | Domain |
|---|---|
| `auth` | Login, token issuance, password verification |
| `vehicles` | Fleet vehicle CRUD and status management |
| `drivers` | Driver profiles, license tracking, status |
| `trips` | Trip creation, dispatch, state transitions |
| `maintenance` | Maintenance log records per vehicle |
| `fuel` | Fuel usage logs per vehicle |
| `analytics` | Aggregated operational metrics |

### Module Folder Structure

```
src/modules/vehicles/
  ├── vehicle.routes.js      ← API endpoints + middleware
  ├── vehicle.controller.js  ← Request parsing, response formatting
  └── vehicle.service.js     ← Business logic + Prisma queries
```

### Layer Responsibilities

**Routes**
- Define REST API endpoints
- Attach authentication middleware (JWT verification)
- Attach role-based access middleware (`authorizeRoles`)

**Controllers**
- Parse and validate incoming request data
- Invoke the appropriate service method
- Return standardized `{ success, message, data }` responses

**Services**
- Contain all application business logic
- Execute Prisma queries against PostgreSQL
- Enforce domain rules and workflow state transitions
- Use Prisma transactions for multi-entity atomic updates

### Application Entry Points

| File | Responsibility |
|---|---|
| `server.js` | Loads environment, connects Prisma, starts HTTP server, handles graceful shutdown |
| `app.js` | Configures global middleware, mounts API routes, sets up 404 + error handlers |

---

## 6. Data Model

FleetFlow's PostgreSQL schema models the core entities of fleet operations. All schema changes are managed via Prisma migrations in `schema.prisma`.

### Core Entities

| Entity | Description | Key Fields |
|---|---|---|
| `User` | Authentication and authorization | id, email, passwordHash, role |
| `Vehicle` | Fleet asset | id, licensePlate, status, capacityKg, make, model |
| `Driver` | Operator assigned to trips | id, name, licenseNumber, licenseExpiry, status |
| `Trip` | Links a vehicle to a driver | id, vehicleId, driverId, status, cargoKg |
| `MaintenanceLog` | Vehicle maintenance record | id, vehicleId, description, date, cost |
| `FuelLog` | Fuel usage record | id, vehicleId, liters, cost, date |

### Entity Relationships

```
User         → (no FK; role controls access)
Vehicle      ← MaintenanceLog  (1-to-many)
Vehicle      ← FuelLog         (1-to-many)
Vehicle      ← Trip            (1-to-many)
Driver       ← Trip            (1-to-many)
```

---

## 7. Workflow State Model

FleetFlow uses **enumerations** to model workflow states, effectively creating a state-machine-style domain model. State transitions are enforced in the **service layer only** — never in controllers.

### Enumerations

| Enum | Values |
|---|---|
| `Role` | `ADMIN`, `MANAGER`, `VIEWER` |
| `VehicleStatus` | `AVAILABLE`, `ON_TRIP`, `MAINTENANCE`, `RETIRED` |
| `DriverStatus` | `ON_DUTY`, `ON_TRIP`, `OFF_DUTY`, `INACTIVE` |
| `TripStatus` | `DRAFT`, `DISPATCHED`, `COMPLETED`, `CANCELLED` |

### Trip Dispatch — Lifecycle Example

```
Trip:    DRAFT      ──►  DISPATCHED
Vehicle: AVAILABLE  ──►  ON_TRIP
Driver:  ON_DUTY    ──►  ON_TRIP
```

All three entity updates are committed within a **single Prisma transaction** — either everything succeeds or nothing changes.

---

## 8. Authentication & Authorization

### Login Flow

```
1. POST /api/auth/login  ← user submits credentials
2. Backend looks up user by email
3. bcrypt.compare() verifies the password
4. JWT issued with { userId, role }
5. Frontend stores JWT in Zustand + localStorage
6. All Axios requests attach: Authorization: Bearer <token>
```

### Backend Auth Files

| File | Purpose |
|---|---|
| `auth.service.js` | Password verification, JWT issuance, user lookup |
| `auth.js` (middleware) | JWT verification, attaches `req.user` to request context |

### Role-Based Access Control

**Backend (true security boundary)** — `authorizeRoles(...)` middleware checks the role embedded in the verified JWT before any controller logic runs. This cannot be bypassed from the frontend.

**Frontend (UX only)** — `ProtectedRoute.jsx` prevents rendering of routes the user lacks permission to view. This is a UX convenience, not a security measure.

---

## 9. Frontend Architecture

The frontend is a React dashboard application responsible for route rendering, auth state management, API communication, and UI presentation. It contains **no business logic**.

### Key Files

| File | Responsibility |
|---|---|
| `App.jsx` | Root component — defines all client-side routes |
| `useAuthStore.js` | Zustand store — holds JWT, user role, login/logout actions |
| `axios.js` | Preconfigured Axios instance — attaches JWT to all requests automatically |
| `DashboardLayout.jsx` | Shared layout — navigation sidebar + page outlet |

### Page → API Mapping

| Page | API Endpoints Used |
|---|---|
| Login | `POST /api/auth/login` |
| Dashboard | `GET /api/analytics/dashboard` |
| Vehicles | `GET /api/vehicles` |
| Drivers | `GET /api/drivers` |
| Trips | `GET /api/trips`, `POST /api/trips` |
| Analytics | `GET /api/analytics`, `GET /api/vehicles` |
| Maintenance | `GET /api/maintenance` |
| Fuel | `GET /api/fuel` |

### State Management Pattern

Zustand is used **only for global authentication state**. Local page-level data is fetched via Axios and managed in React component state — keeping the global store lightweight and focused.

---

## 10. API Reference

### Standard Response Format

```json
{
  "success": true,
  "message": "Human-readable status message",
  "data": { }
}
```

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Authenticate user, return JWT | No |
| POST | `/api/auth/register` | Create new user account | ADMIN |

### Vehicles

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/vehicles` | List all vehicles | Yes |
| POST | `/api/vehicles` | Create a vehicle | ADMIN / MANAGER |
| GET | `/api/vehicles/:id` | Get vehicle by ID | Yes |
| PATCH | `/api/vehicles/:id` | Update vehicle | ADMIN / MANAGER |
| DELETE | `/api/vehicles/:id` | Remove a vehicle | ADMIN |

### Drivers

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/drivers` | List all drivers | Yes |
| POST | `/api/drivers` | Add a new driver | ADMIN / MANAGER |
| GET | `/api/drivers/:id` | Get driver by ID | Yes |
| PATCH | `/api/drivers/:id` | Update driver record | ADMIN / MANAGER |

### Trips

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/trips` | List all trips | Yes |
| POST | `/api/trips` | Create trip (DRAFT) | MANAGER+ |
| GET | `/api/trips/:id` | Get trip by ID | Yes |
| POST | `/api/trips/:id/dispatch` | Dispatch trip | MANAGER+ |
| POST | `/api/trips/:id/complete` | Complete a trip | MANAGER+ |
| POST | `/api/trips/:id/cancel` | Cancel a trip | MANAGER+ |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/dashboard` | Summary metrics for the dashboard |
| GET | `/api/analytics` | Full operational analytics dataset |

---

## 11. Business Logic Layer

All application rules live exclusively in the **service layer**. Controllers are intentionally thin.

### Trip Dispatch Validation (`trip.service.js`)

Before any database write, the service verifies:

1. Trip exists in the database
2. Trip status is `DRAFT`
3. Assigned vehicle status is `AVAILABLE`
4. Assigned driver status is `ON_DUTY`
5. Driver's license expiry date is in the future
6. Trip cargo weight does not exceed vehicle capacity

If all checks pass, the following are committed in a **single Prisma transaction**:

- `Trip.status` → `DISPATCHED`
- `Vehicle.status` → `ON_TRIP`
- `Driver.status` → `ON_TRIP`

If any check fails, an `AppError` is thrown and the transaction is never opened.

---

## 12. Analytics

All aggregation and computation is performed **server-side** in `analytics.service.js`, ensuring consistency regardless of which user or view requests the data.

### Available Metrics

- Total vehicles by status (`AVAILABLE`, `ON_TRIP`, `MAINTENANCE`, `RETIRED`)
- Total drivers by status
- Trip counts by status and time period
- Fuel consumption aggregates per vehicle
- Maintenance cost summaries per vehicle
- Fleet utilization rates

---

## 13. Validation & Error Handling

### Input Validation

All request bodies are validated using **Zod schemas** defined in `schemas.js`. Validation occurs before the request reaches the controller. Invalid inputs receive a structured `400` response immediately.

### Error Handling Pipeline

| File | Purpose |
|---|---|
| `AppError.js` | Custom error class for operational errors with HTTP status codes |
| `catchAsync.js` | Wraps async controllers — forwards thrown errors to the centralized handler |
| `errorHandler.js` | Express error middleware — formats all error responses uniformly |

### Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "statusCode": 400
}
```

---

## 14. Design Philosophy

FleetFlow is built for **clarity, maintainability, and fast iteration** — not maximum scalability.

- **Clear module boundaries** — each module owns its routes, controller, and service
- **Centralized business rules** — the service layer is the single source of truth
- **Predictable REST APIs** — consistent request/response shapes across all endpoints
- **Role-based dashboards** — UI adapts to user role without complex permission trees
- **Database-first state** — Prisma enums define all valid states; code enforces transitions
---

## 15. Future Improvements

- Real-time fleet tracking via WebSockets or GPS telemetry integration
- Background job processing for scheduled maintenance reminders
- Vehicle telemetry ingestion pipeline
- Multi-tenant architecture for fleet management SaaS
- Advanced analytics pipelines with historical trend analysis
- Push notification system for maintenance alerts and trip events
- Mobile application for drivers (trip acceptance, status updates)
- Audit log — track all state changes with timestamps and actor identity



