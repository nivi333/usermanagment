# User Management System - Requirements Document

## Project Overview

Build a full-stack user management application that allows creating, reading, updating, and deleting user records. This project will serve as a practice exercise for implementing a complete end-to-end application with modern technologies.

## Technology Stack

### Frontend
- **Framework**: React 18+
- **UI Library**: Ant Design (antd) 5.x
- **Styling**: Styled Components
- **Language**: TypeScript
- **Build Tool**: Vite with TypeScript template
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM/Query Builder**: TypeORM
- **API Documentation**: Swagger/OpenAPI 

### Database
- **Database**: PostgreSQL 14+
- **Schema Management**: Migrations through chosen ORM

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Environment Management**: .env files

## Functional Requirements

### 1. User Model

The user entity should have the following fields:

```typescript
interface User {
  id: string;           // UUID, auto-generated
  firstName: string;    // Required, max 50 chars
  lastName: string;     // Required, max 50 chars
  email: string;        // Required, unique, valid email format
  phoneNumber: string;  // Optional, format: +1-XXX-XXX-XXXX
  dateOfBirth: Date;    // Required
  address: {
    street: string;     // Required, max 100 chars
    city: string;       // Required, max 50 chars
    state: string;      // Required, 2 char code (for US)
    zipCode: string;    // Required, 5 digits
    country: string;    // Required, default: "USA"
  };
  department: string;   // Required, enum: ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations"]
  position: string;     // Required, max 50 chars
  startDate: Date;      // Required
  status: string;       // Required, enum: ["Active", "Inactive", "On Leave"]
  createdAt: Date;      // Auto-generated
  updatedAt: Date;      // Auto-updated
}
```

### 2. API Endpoints

#### Base URL: `/api/v1`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/users` | Get all users with pagination | Query params: `page`, `limit`, `search`, `department`, `status` | Paginated user list |
| GET | `/users/:id` | Get single user by ID | None | User object |
| POST | `/users` | Create new user | User object (without id, createdAt, updatedAt) | Created user object |
| PUT | `/users/:id` | Update existing user | Partial user object | Updated user object |
| DELETE | `/users/:id` | Delete user | None | Success message |
| GET | `/users/stats` | Get user statistics | None | Statistics object |

#### API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}

// Paginated Response
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 3. Frontend Features

#### 3.1 User List Page (`/users`)
- Display users in a table with the following columns:
  - Name (First + Last)
  - Email
  - Department
  - Position
  - Status (with color coding)
  - Actions (Edit, Delete)
- Implement pagination (10 users per page)
- Add search functionality (search by name or email)
- Filter by department and status
- Sort by name, email, or start date
- Bulk actions: Select multiple users and delete

#### 3.2 Create User Page (`/users/new`)
- Form with all user fields
- Client-side validation:
  - Required field validation
  - Email format validation
  - Phone number format validation
  - Date validations (DOB must be 18+ years ago, start date cannot be future)
- Real-time validation feedback
- Success/Error notifications
- Redirect to user list after successful creation

#### 3.3 Edit User Page (`/users/:id/edit`)
- Pre-populated form with existing user data
- Same validations as create form
- Show last updated timestamp
- Cancel button to return to list without saving

#### 3.4 User Details Page (`/users/:id`)
- Read-only view of all user information
- Formatted display with sections:
  - Personal Information
  - Contact Information
  - Work Information
- Edit and Delete buttons
- Back to list button

#### 3.5 Dashboard/Statistics Page (`/`)
- Total number of users
- Users by department (pie chart)
- Users by status (bar chart)
- Recent additions (last 5 users)
- Quick actions: Add new user button

### 4. Non-Functional Requirements

#### 4.1 Frontend Requirements
- Responsive design (mobile, tablet, desktop)
- Loading states for all async operations
- Error boundaries for graceful error handling
- Toast notifications for success/error messages
- Consistent color scheme and spacing using styled-components theme
- TypeScript strict mode enabled
- ESLint and Prettier configuration

#### 4.2 Backend Requirements
- Input validation using middleware
- Error handling middleware
- Request logging
- CORS configuration
- TypeScript strict mode enabled
- ESLint configuration

#### 4.3 Database Requirements
- Proper indexing on frequently queried fields (email, department, status)
- Migration scripts for schema changes

## Docker Configuration

### 1. Frontend Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 2. Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 3. Docker Compose Configuration
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://backend:3000

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/userdb
      - NODE_ENV=production

  postgres:
    image: postgres:14-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=userdb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── UserDetails.tsx
│   │   │   └── UserFilters.tsx
│   │   └── dashboard/
│   │       ├── StatisticsCards.tsx
│   │       └── Charts.tsx
│   ├── pages/
│   │   ├── UserListPage.tsx
│   │   ├── CreateUserPage.tsx
│   │   ├── EditUserPage.tsx
│   │   ├── UserDetailsPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── user.ts
│   ├── utils/
│   │   └── validators.ts
│   ├── styles/
│   │   ├── theme.ts
│   │   └── GlobalStyles.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
├── Dockerfile
├── nginx.conf
├── package.json
├── tsconfig.json
└── .env
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── userController.ts
│   ├── services/
│   │   └── userService.ts
│   ├── models/
│   │   └── User.ts
│   ├── routes/
│   │   └── userRoutes.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── logger.ts
│   ├── config/
│   │   └── database.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── validators.ts
│   └── index.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env
```

## Notes

- Focus on code quality over feature quantity
- Commit frequently with meaningful messages
- Use environment variables for configuration
- Follow RESTful API conventions
- Implement proper TypeScript types (avoid `any`)
- Handle edge cases (empty states, network errors, etc.)
- Consider accessibility (ARIA labels, keyboard navigation)