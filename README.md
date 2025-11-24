# 🔗 Allinks API

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A production-ready URL shortener service built with Clean Architecture, TypeScript, and Express. Features include user authentication, link management, email verification, and comprehensive security measures.

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
  - [Clean Architecture Layers](#clean-architecture-layers)
  - [Design Patterns](#design-patterns)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [Data Flow](#-data-flow)
- [API Documentation](#-api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Link Management Endpoints](#link-management-endpoints)
  - [Bulk Operations](#bulk-operations)
- [Security](#-security)
- [Testing](#-testing)
- [Docker Environment](#-docker-environment)
- [Development](#-development)
  - [Development Workflow](#development-workflow)
  - [Code Quality](#code-quality)
  - [Adding New Features](#adding-new-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🎯 Overview

Allinks is a modern, scalable URL shortening service designed with enterprise-grade architecture patterns. Built using Clean Architecture principles, it ensures maintainability, testability, and scalability.

### Key Highlights

- **Clean Architecture**: Separation of concerns with clear boundaries
- **Type Safety**: Full TypeScript implementation
- **Security First**: JWT authentication, RBAC, email verification
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Email System**: Nodemailer integration for notifications
- **RESTful API**: Well-documented endpoints
- **Production Ready**: Docker support, environment configurations

## ✨ Features

### User Management

- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Password reset via email
- ✅ Refresh token rotation
- ✅ User profile management

### Link Management

- ✅ Create shortened links
- ✅ Custom short codes
- ✅ Link expiration dates
- ✅ Active/inactive status
- ✅ Click tracking
- ✅ Link statistics
- ✅ Bulk operations (reorder, delete, update)

### Security

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ IDOR protection
- ✅ Rate limiting
- ✅ Input validation with Zod
- ✅ SQL injection prevention
- ✅ XSS protection

### Email System

- ✅ Welcome emails
- ✅ Email verification
- ✅ Password reset emails
- ✅ HTML templates
- ✅ Multiple SMTP providers support

## 🏗️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER
│  (Controllers, Routes, Middlewares, HTTP Handlers)
│
│  • Express Controllers
│  • Route Definitions
│  • Validation Middlewares
│  • Authentication/Authorization
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER
│        (External Services, Adapters, Implementations)
│
│  • Database (Prisma ORM)
│  • Email Service (Nodemailer)
│  • JWT Token Provider
│  • Password Hasher (bcrypt)
│  • Repository Implementations
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER
│           (Business Logic, Use Cases, Entities)
│
│  • Entities (User, Link, Token)
│  • Use Cases (Business Rules)
│  • Repository Interfaces
│  • DTOs (Data Transfer Objects)
│  • Domain Interfaces
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Repository Pattern**: Abstract data access layer
- **Dependency Injection**: Loose coupling between layers
- **Factory Pattern**: Object creation
- **Adapter Pattern**: External services integration
- **Strategy Pattern**: Multiple authentication strategies
- **Middleware Pattern**: Request/response processing

### Layer Responsibilities

#### 1. Domain Layer (Business Logic)

```
src/domain/
├── entities/         # Business entities
├── use-cases/        # Business rules & logic
├── repositories/     # Data access interfaces
├── dtos/            # Data transfer objects
└── interfaces/      # Service contracts
```

**Responsibilities:**

- Define business entities
- Implement business rules
- Define interfaces for external dependencies
- NO framework dependencies
- Pure TypeScript/JavaScript

#### 2. Infrastructure Layer (External Services)

```
src/infraestructure/
├── adapters/        # External service implementations
├── datasources/     # Data source implementations
├── repositories/    # Repository implementations
├── mappers/         # Data transformation
└── validations/     # Input validation schemas
```

**Responsibilities:**

- Implement domain interfaces
- Connect to external services (DB, Email, etc.)
- Handle data persistence
- Framework-specific code

#### 3. Presentation Layer (HTTP)

```
src/presentation/
├── auth/           # Auth controllers & routes
├── links/          # Links controllers & routes
├── middlewares/    # Express middlewares
└── routes.ts       # Route configuration
```

**Responsibilities:**

- Handle HTTP requests/responses
- Route management
- Authentication/Authorization
- Input validation
- Error handling

## 🛠️ Tech Stack

### Core

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Framework**: Express.js 4.18+
- **Package Manager**: pnpm

### Database

- **ORM**: Prisma 5.0+
- **Database**: PostgreSQL 14+
- **Migration Tool**: Prisma Migrate

### Authentication & Security

- **JWT**: jsonwebtoken
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **CORS**: cors
- **Helmet**: Security headers

### Email

- **Email Service**: Nodemailer
- **Template Engine**: HTML templates

### Testing

- **Test Framework**: Jest
- **HTTP Testing**: Supertest
- **Mocking**: jest-mock-extended

### Development Tools

- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Git Hooks**: Husky
- **Environment**: dotenv

### DevOps

- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Process Manager**: PM2 (production)

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

```bash
node >= 18.0.0
pnpm >= 8.0.0
docker >= 20.10.0 (optional)
postgresql >= 14.0 (if not using Docker)
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/Allinks.git
cd Allinks
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

### Configuration

Edit `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/Allinks"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# SMTP / Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@Allinks.com
SMTP_FROM_NAME=Allinks
```

### Database Setup

1. **Start PostgreSQL** (with Docker):

```bash
docker-compose -f docker-compose.db.yml up -d
```

2. **Run migrations**:

```bash
pnpm prisma migrate dev
```

3. **Generate Prisma Client**:

```bash
pnpm prisma generate
```

4. **Seed database** (optional):

```bash
pnpm prisma db seed
```

### Running the Application

#### Development Mode

```bash
pnpm dev
```

#### Production Mode

```bash
pnpm build
pnpm start
```

#### With Docker

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

## 📁 Project Structure

```
Allinks/
├── prisma/
│   ├── migrations/           # Database migrations
│   └── schema.prisma         # Prisma schema
│
├── src/
│   ├── domain/              # Business Logic Layer
│   │   ├── entities/        # Domain entities
│   │   ├── use-cases/       # Use cases (business rules)
│   │   ├── repositories/    # Repository interfaces
│   │   ├── datasources/     # Datasource interfaces
│   │   ├── dtos/           # Data Transfer Objects
│   │   └── interfaces/      # Service interfaces
│   │
│   ├── infraestructure/     # Infrastructure Layer
│   │   ├── adapters/        # External service adapters
│   │   ├── datasources/     # Datasource implementations
│   │   ├── repositories/    # Repository implementations
│   │   ├── mappers/         # Entity mappers
│   │   ├── validations/     # Zod schemas
│   │   ├── email/          # Email templates
│   │   ├── utils/          # Utility functions
│   │   └── prismadb.ts     # Prisma client
│   │
│   ├── presentation/        # Presentation Layer
│   │   ├── auth/           # Auth module
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   ├── links/          # Links module
│   │   │   ├── links.controller.ts
│   │   │   └── links.routes.ts
│   │   ├── redirect/       # Redirect module
│   │   ├── middlewares/    # Express middlewares
│   │   ├── routes.ts       # Main routes
│   │   └── server.ts       # Express server
│   │
│   ├── config/             # Configuration
│   │   ├── env.ts
│   │   └── index.ts
│   │
│   └── app.ts              # Application entry
│
├── tests/                  # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/              # E2E tests
│   ├── helpers/          # Test helpers
│   └── setup.ts          # Test configuration
│
├── scripts/               # Utility scripts
├── docs/                 # Additional documentation
│   ├── TESTING.md
│   ├── AUTHORIZATION.md
│   ├── EMAIL_MODULE.md
│   └── LINKS_MODULE.md
│
├── .github/              # GitHub configuration
│   └── workflows/        # CI/CD workflows
│
├── docker-compose.yml    # Docker composition
├── Dockerfile           # Docker image
├── package.json         # Dependencies
├── tsconfig.json       # TypeScript config
├── jest.config.ts      # Jest configuration
└── README.md          # This file
```

## 🔄 Data Flow

### Request Flow

```
1. HTTP Request
   ↓
2. Express Router
   ↓
3. Middlewares (Auth, Validation)
   ↓
4. Controller (Presentation Layer)
   ↓
5. Use Case (Domain Layer)
   ↓
6. Repository Interface (Domain)
   ↓
7. Repository Implementation (Infrastructure)
   ↓
8. Datasource (Infrastructure)
   ↓
9. Database (Prisma)
   ↓
10. Response Flow (reverse order)
```

### Example: Create Link Flow

```typescript
// 1. HTTP Request
POST /api/links
Authorization: Bearer <token>
Body: { originalUrl: "https://example.com" }

// 2. Routes (Presentation)
router.post('/', authMiddleware, validateMiddleware, controller.createLink)

// 3. Controller (Presentation)
controller.createLink() {
  const dto = CreateLinkDto.create(req.body)
  const result = await createLinkUseCase.execute(dto)
  return res.json(result)
}

// 4. Use Case (Domain)
createLinkUseCase.execute(dto) {
  const shortCode = generateShortCode()
  const link = await repository.create({ ...dto, shortCode })
  return link
}

// 5. Repository (Infrastructure)
repository.create(data) {
  return datasource.create(data)
}

// 6. Datasource (Infrastructure)
datasource.create(data) {
  return prisma.link.create({ data })
}

// 7. Database
INSERT INTO links ...

// 8. Response
{ link: { id, shortCode, shortUrl, ... } }
```

## 📚 API Documentation

### Base URL

```
Development: http://localhost:3000
Production: https://api.yourapp.com
```

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response: 200 OK
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### Verify Email

```http
GET /api/auth/verify-email?token={verification-token}

Response: 200 OK (or redirect to frontend)
{
  "success": true,
  "message": "Email verified successfully"
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

Response: 200 OK
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "current-refresh-token"
}

Response: 200 OK
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer {access-token}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer {access-token}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Link Management Endpoints

#### Create Link

```http
POST /api/links
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "originalUrl": "https://example.com/very/long/url",
  "title": "My Link",
  "description": "Link description",
  "customShortCode": "mycode",  // Optional
  "expiresAt": "2024-12-31T23:59:59Z"  // Optional
}

Response: 201 Created
{
  "message": "Link created successfully",
  "link": {
    "id": "uuid",
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "mycode",
    "shortUrl": "http://localhost:3000/mycode",
    "title": "My Link",
    "description": "Link description",
    "expiresAt": "2024-12-31T23:59:59Z",
    "isActive": true,
    "clickCount": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get User Links

```http
GET /api/links?page=1&limit=10&isActive=true&search=example
Authorization: Bearer {access-token}

Response: 200 OK
{
  "links": [
    {
      "id": "uuid",
      "shortCode": "abc123",
      "shortUrl": "http://localhost:3000/abc123",
      "originalUrl": "https://example.com",
      "title": "Example",
      "clickCount": 42,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Get Link by ID

```http
GET /api/links/{link-id}
Authorization: Bearer {access-token}

Response: 200 OK
{
  "link": {
    "id": "uuid",
    "originalUrl": "https://example.com",
    "shortCode": "abc123",
    "shortUrl": "http://localhost:3000/abc123",
    ...
  }
}
```

#### Update Link

```http
PUT /api/links/{link-id}
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description",
  "isActive": false,
  "expiresAt": "2025-12-31T23:59:59Z"
}

Response: 200 OK
{
  "message": "Link updated successfully",
  "link": { ... }
}
```

#### Delete Link

```http
DELETE /api/links/{link-id}
Authorization: Bearer {access-token}

Response: 200 OK
{
  "message": "Link deleted successfully"
}
```

#### Get Link Statistics

```http
GET /api/links/{link-id}/stats
Authorization: Bearer {access-token}

Response: 200 OK
{
  "link": { ... },
  "stats": {
    "totalClicks": 42,
    "isExpired": false,
    "daysUntilExpiration": 30
  }
}
```

#### Redirect (Public)

```http
GET /{short-code}

Response: 301 Moved Permanently
Location: https://original-url.com
```

### Bulk Operations

#### Reorder Links

```http
POST /api/links/bulk/reorder
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "orders": [
    { "linkId": "uuid-1", "order": 0 },
    { "linkId": "uuid-2", "order": 1 },
    { "linkId": "uuid-3", "order": 2 }
  ]
}

Response: 200 OK
{
  "success": true,
  "reorderedLinks": [...],
  "message": "Successfully reordered 3 links"
}
```

#### Bulk Delete Links

```http
POST /api/links/bulk/delete
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "linkIds": ["uuid-1", "uuid-2", "uuid-3"]
}

Response: 200 OK
{
  "success": true,
  "deletedCount": 3,
  "message": "Successfully deleted 3 links"
}
```

#### Bulk Update Links

```http
POST /api/links/bulk/update
Authorization: Bearer {access-token}
Content-Type: application/json

{
  "linkIds": ["uuid-1", "uuid-2"],
  "updates": {
    "isActive": false
  }
}

Response: 200 OK
{
  "success": true,
  "links": [...],
  "message": "Successfully updated 2 links"
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

#### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## 🔒 Security

### Authentication

- JWT-based authentication with access and refresh tokens
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days
- Secure cookie storage (httpOnly, secure, sameSite)

### Authorization

- Role-based access control (RBAC)
- Resource ownership verification
- IDOR (Insecure Direct Object Reference) protection
- Bulk operation authorization

### Data Protection

- Password hashing with bcrypt (10 rounds)
- SQL injection prevention (Prisma ORM)
- XSS protection (input sanitization)
- CORS configuration
- Helmet security headers
- Rate limiting

### Email Security

- Email verification required
- Password reset token expiration (1 hour)
- One-time use tokens
- Secure token generation

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Run Specific Test Suites

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# With coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Test Structure

```
tests/
├── unit/              # Unit tests (no external dependencies)
│   ├── adapters/
│   ├── use-cases/
│   └── middleware/
├── integration/       # Integration tests (with mocked DB)
│   ├── repositories/
│   └── datasources/
├── e2e/              # End-to-end tests (full stack)
│   ├── auth.e2e.test.ts
│   └── links.e2e.test.ts
└── helpers/          # Test utilities
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## 🐳 Docker Environment

### Using Docker Compose

#### Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

#### Production

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Compose Services

#### docker-compose.yml (Production)

```yaml
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

#### docker-compose.dev.yml (Development)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - '3000:3000'
    command: pnpm dev
```

### Manual Docker Commands

```bash
# Build image
docker build -t Allinks:latest .

# Run container
docker run -d \
  --name Allinks \
  -p 3000:3000 \
  -e DATABASE_URL="..." \
  Allinks:latest

# View logs
docker logs -f Allinks

# Execute commands in container
docker exec -it Allinks pnpm prisma migrate dev
```

## 💻 Development

### Development Workflow

1. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

```bash
# Edit files
code .
```

3. **Run tests**

```bash
pnpm test
```

4. **Commit your changes**

```bash
git add .
git commit -m "feat: add new feature"
```

5. **Push and create PR**

```bash
git push origin feature/your-feature-name
```

### Code Quality

#### Linting

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix
```

#### Type Checking

```bash
# Check types
pnpm type-check
```

#### Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Adding New Features

#### 1. Add New Entity

```typescript
// src/domain/entities/your-entity.entity.ts
export class YourEntity {
  constructor(
    public id: string,
    public name: string
    // ... other properties
  ) {}

  static fromObject(object: any): YourEntity {
    // Validation and creation logic
  }
}
```

#### 2. Add Use Case

```typescript
// src/domain/use-cases/your-feature/your-use-case.ts
export class YourUseCase {
  constructor(private readonly repository: YourRepository) {}

  async execute(dto: YourDto): Promise<Result> {
    // Business logic here
  }
}
```

#### 3. Add Repository Interface

```typescript
// src/domain/repositories/your.repository.ts
export abstract class YourRepository {
  abstract create(data: CreateData): Promise<YourEntity>;
  abstract findById(id: string): Promise<YourEntity | null>;
  // ... other methods
}
```

#### 4. Implement Infrastructure

```typescript
// src/infraestructure/repositories/your.repository.impl.ts
export class YourRepositoryImpl implements YourRepository {
  constructor(private readonly datasource: YourDatasource) {}

  async create(data: CreateData): Promise<YourEntity> {
    return this.datasource.create(data);
  }
}
```

#### 5. Add Controller

```typescript
// src/presentation/your-feature/your.controller.ts
export class YourController {
  constructor(private readonly useCase: YourUseCase) {}

  yourMethod = async (req: Request, res: Response) => {
    const result = await this.useCase.execute(dto);
    return res.json(result);
  };
}
```

#### 6. Add Routes

```typescript
// src/presentation/your-feature/your.routes.ts
export class YourRoutes {
  static get routes(): Router {
    const router = Router();
    const controller = new YourController(useCase);

    router.post('/', authMiddleware, controller.yourMethod);

    return router;
  }
}
```

#### 7. Add Tests

```typescript
// tests/unit/use-cases/your-use-case.test.ts
describe('YourUseCase', () => {
  it('should do something', async () => {
    // Test implementation
  });
});
```

### Database Migrations

#### Create Migration

```bash
pnpm dlx prisma migrate dev --name your_migration_name
```

#### Apply Migrations

```bash
# Development
pnpm prisma migrate dev

# Production
pnpm prisma migrate deploy
```

#### Reset Database

```bash
pnpm prisma migrate reset
```

### Environment Variables

Create `.env.local` for local overrides (not committed):

```bash
cp .env .env.local
# Edit .env.local with your local settings
```

## 🚀 Deployment

### Prerequisites

- Node.js 18+ installed on server
- PostgreSQL 14+ database
- SMTP credentials
- Domain name (optional)

### Deployment Steps

#### 1. Build Application

```bash
pnpm install --production=false
pnpm build
```

#### 2. Setup Environment

```bash
# Copy and configure production env
cp .env.example .env.production
# Edit .env.production with production values
```

#### 3. Run Migrations

```bash
NODE_ENV=production pnpm prisma migrate deploy
```

#### 4. Start Application

```bash
# With PM2
pm2 start dist/app.js --name Allinks

# Or with Node
NODE_ENV=production node dist/app.js
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'Allinks',
    script: './dist/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

// Start with PM2
pm2 start ecosystem.config.js
```

### Docker Deployment

```bash
# Build production image
docker build -t Allinks:latest .

# Run with docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/health/db
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Contribution Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests**
5. **Ensure tests pass**
   ```bash
   pnpm test
   ```
6. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Style

- Follow existing code style
- Use TypeScript strict mode
- Write meaningful variable names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Write tests for new features

### Pull Request Guidelines

- Provide clear description of changes
- Link related issues
- Include screenshots for UI changes
- Ensure CI passes
- Request review from maintainers

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### Database Connection Errors

```bash
# Check PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose -f docker-compose.db.yml restart

# Check connection string
echo $DATABASE_URL
```

#### Migration Errors

```bash
# Reset database (development only)
pnpm prisma migrate reset

# Check migration status
pnpm prisma migrate status
```

#### Email Not Sending

1. Check SMTP credentials
2. Verify SMTP_USER and SMTP_PASS
3. Enable "Less secure app access" (Gmail)
4. Use App Password instead of account password

#### Tests Failing

```bash
# Clear Jest cache
pnpm jest --clearCache

# Run tests in verbose mode
pnpm test:verbose

# Run specific test
pnpm test path/to/test.ts
```

### Debug Mode

Enable debug logs:

```bash
DEBUG=* pnpm dev
```

### Getting Help

- Open an [Issue](https://github.com/Profesional-Portfolio/allinks-backend/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **David Mendoza** - _Initial work_ - [GitHub](https://github.com/deivid182)

## 🙏 Acknowledgments

- Clean Architecture by Robert C. Martin
- Express.js team
- Prisma team
- TypeScript community
- All contributors

## 📞 Contact

- Email: davidmendoza182@outlook.com
- Twitter: [@DaveDev5173](https://x.com/DaveDev5173)
- LinkedIn: [David Mendoza](https://www.linkedin.com/in/david-pmjs/)

---

<div align="center">
  
**[⬆ Back to Top](#-Allinks-api)**

Made with ❤️ by [deivid182](https://github.com/deivid182)

</div>
