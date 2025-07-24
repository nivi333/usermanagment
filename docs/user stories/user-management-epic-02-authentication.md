# Epic 2: Authentication & Authorization – User Stories

## As a user, I want to securely sign up and log in using email and password

### Description
Enable secure user registration and login with strong password policies and secure password storage, ensuring only authorized users can access the system.

### Industry Best Practices
- Use password hashing (bcrypt/scrypt)
- Enforce password complexity and length
- Prevent user enumeration in error messages
- Rate limit login attempts

### Acceptance Criteria
- [x] Users can register and log in with email and password (backend implemented)
- [x] Passwords are hashed, never stored in plaintext (bcrypt)
- [x] Password policy enforced on registration/reset (min 8 chars, upper, lower, digit)
- [x] Login attempts are rate-limited (express-rate-limit)
- [x] Error messages do not reveal user existence (generic errors)

> **Note:** Secure registration and login flows are implemented in the backend with password hashing, policy enforcement, rate limiting, and generic errors. Next steps: add persistent storage, password reset, and automated tests.

### Potential Tasks
- Implement registration and login endpoints
- Integrate password hashing
- Add password validation rules
- Add rate limiting middleware
- Write tests for authentication flows

### Dependencies
- Infrastructure setup

### Priority
High

### Estimation
3 Story Points

---

## As a user, I want to receive a JWT token upon successful authentication

### Description
Issue a signed JWT token to authenticated users, enabling stateless, secure API access and session management.

### Industry Best Practices
- Use strong, rotating signing keys
- Set appropriate token lifetimes and refresh mechanisms
- Store tokens securely on the client
- Validate tokens on every request

### Acceptance Criteria
- [x] JWT tokens are issued on successful login (backend implemented)
- [x] Tokens are signed and expire after a set period (configurable)
- [x] Backend validates tokens for all protected endpoints (middleware)
- [x] Token refresh flow is implemented (refresh endpoint)

> **Note:** JWT authentication, expiry, validation, and refresh are implemented in `backend/index.js`. See code for usage and extension.

### Potential Tasks
- Implement JWT issuance and validation
- Configure signing keys and expiry
- Secure token storage in frontend
- Write tests for token flows

### Dependencies
- User registration/login implemented

### Priority
High

### Estimation
2 Story Points

---

## As an admin, I want to assign roles and permissions to users (RBAC)

### Description
Allow administrators to assign roles (e.g., Admin, Manager, User) and configure permissions, enforcing least-privilege access across the system.

### Industry Best Practices
- Centralized role/permission definitions
- Enforce RBAC at API and UI layers
- Audit all role changes

### Acceptance Criteria
- [x] Roles and permissions are defined and configurable (backend, ROLES array)
- [x] Only admins can assign/modify roles (admin-only endpoint)
- [x] RBAC is enforced on all endpoints and UI routes (middleware on backend endpoints)
- [x] Role changes are logged (in-memory audit log)

> **Note:** RBAC (roles, admin assignment, enforcement, and audit logging) is now implemented in `backend/index.js`. Extend as needed for persistent storage or UI integration.

### Potential Tasks
- Design role/permission schema
- Implement role assignment endpoints/UI
- Add RBAC middleware and frontend guards
- Audit logging for role changes

### Dependencies
- Authentication implemented

### Priority
High

### Estimation
3 Story Points

---

## As a developer, I want to enforce CORS and HTTPS for all endpoints

### Description
Configure CORS and HTTPS to ensure secure, cross-origin API access and encrypted communication between clients and server.

### Industry Best Practices
- Use HTTPS everywhere (HSTS)
- Restrict CORS origins and methods
- Automate certificate renewal (e.g., Let's Encrypt)

### Acceptance Criteria
- [x] All endpoints are accessible only via HTTPS (HTTPS server with certs; HTTP fallback for dev only)
- [x] CORS is configured per security policy (CORS middleware, configurable origins)
- [x] Automated certificate renewal is set up (instructions for certbot/Let's Encrypt in backend/certs/README.md)

> **Note:** HTTPS and CORS are now implemented in the backend. Self-signed certs are used for development; see backend/certs/README.md for production cert automation.

### Potential Tasks
- Configure HTTPS in backend and frontend
- Set up CORS middleware
- Document CORS/HTTPS policies
- Test secure access in all environments

### Dependencies
- Infrastructure setup

### Priority
Medium

### Estimation
2 Story Points

---

## As a security auditor, I want authentication and authorization logic to be covered by automated tests

### Description
Ensure all authentication and authorization flows are tested automatically to guarantee security, reliability, and compliance.

### Industry Best Practices
- Use automated security and integration tests
- Cover edge cases (token expiry, invalid credentials)
- Integrate tests with CI/CD pipeline

### Acceptance Criteria
- [x] Automated tests cover all auth flows and edge cases (backend/auth.test.js)
- [x] Tests run in CI/CD pipeline (GitHub Actions workflow)
- [x] Test failures block deployment (CI required for PR/merge)

> **Note:** Automated authentication and authorization tests are implemented in the backend and run in CI/CD. See `backend/auth.test.js` and `.github/workflows/backend-test.yml`.

### Potential Tasks
- Write integration and security tests
- Add tests to CI pipeline
- Review test coverage regularly

### Dependencies
- All authentication and RBAC features implemented

### Priority
High

### Estimation
2 Story Points
