# Epic 4: Role-Based Access Control (RBAC) – User Stories

## As an admin, I want to define and manage roles and permissions

### Description
Allow admins to define, assign, and modify user roles and permissions, ensuring least-privilege access and compliance with security policies.

### Industry Best Practices
- Centralized role/permission management
- Enforce RBAC at API and UI levels
- Audit all changes to roles and permissions

### Acceptance Criteria
- [x] Roles and permissions can be created, updated, and deleted
- [x] Only authorized users can manage roles
- [x] All changes are logged and auditable
- [x] Admin login and user creation enforce password policy and hash validation
- [x] User creation requires password meeting policy (backend & frontend)
- [x] User listing endpoint (`GET /users`) is admin-protected (RBAC)
- [x] Backend checks for at least one admin user at startup
- [x] All changes committed and tracked in git

### Implementation Progress
- [x] RBAC middleware (`requireRole`) implemented in backend
- [x] Role assignment endpoint (`/assign-role`) implemented
- [x] Audit log for role changes implemented
- [x] CORS and frontend-backend communication fixed
- [x] Project structure refactored to monorepo
- [x] Backend migration and CRUD endpoints for roles implemented (with audit logging)
- [x] Backend endpoints for permission CRUD implemented (with audit logging)
- [x] Frontend UI for role/permission management implemented (admin-only, TypeScript)
- [x] Admin login and user creation now robust (password policy, hash validation)
- [x] GET `/users` endpoint with admin RBAC protection
- [x] Admin existence check at backend startup
- [x] Add User modal in frontend now enforces password policy
- [x] All changes tracked in git
- [ ] Tests for RBAC features (To Do)


### Potential Tasks
- Design RBAC schema and UI
- Implement role/permission management endpoints
- Add audit logging
- Write tests for RBAC features

### Dependencies
- Authentication implemented
- Auditing infrastructure in place

### Priority
High

### Estimation
3 Story Points

---

## As a developer, I want RBAC enforcement at both backend and frontend

### Description
Ensure all access control checks are enforced consistently in both backend APIs and frontend UI, preventing unauthorized actions.

### Industry Best Practices
- Use middleware/guards for permission checks
- Hide UI elements based on user role
- Test all access control paths

### Acceptance Criteria
- [x] Permission checks in backend and frontend
- [x] Unauthorized access is blocked and logged
- [x] UI adapts to user role

### Implementation Progress
- [x] Backend RBAC middleware (`requireRole`) in place
- [x] Comprehensive frontend guards and UI adaptation (context, ProtectedRoute, UI hiding)
- [x] Unauthorized access is blocked and Not Authorized page shown
- [ ] Full test coverage for access control (To Do)

### Potential Tasks
- Implement backend middleware for RBAC
- Add frontend guards and UI logic
- Write tests for access control

### Dependencies
- RBAC schema implemented

### Priority
High

### Estimation
2 Story Points

---

## As a security auditor, I want all role and permission changes to be logged

### Description
Log all changes to roles and permissions to support compliance, auditability, and forensic analysis.

### Industry Best Practices
- Use immutable, centralized audit logs
- Include who, what, when, and where for each change
- Retain logs per compliance requirements

### Acceptance Criteria
- [x] All role/permission changes are logged with full context
- [x] Logs are immutable and protected (API + DB enforced)
- [x] Only authorized users can view logs (admin-only endpoint)

### Implementation Progress
- [x] Audit log for role/permission changes implemented and accessible
- [x] Secure log storage and immutability (API: no update/delete; DB: migration to revoke update/delete)
- [x] Restrict log access to authorized users only (admin-only)
- [x] Tests for audit logging and immutability added
- [ ] (Optional) Further hardening/documentation

### Potential Tasks
- Integrate audit logging for RBAC changes
- Secure log storage
- Write tests for audit logging

### Dependencies
- Auditing infrastructure in place

### Priority
Medium

### Estimation
2 Story Points
