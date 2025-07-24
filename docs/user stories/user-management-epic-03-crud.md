# Epic 3: User Management Core (CRUD) – Actionable TODOs

## Objective
Refactor and expand the user management system to fully meet the project requirements for a modern, production-grade CRUD application.

---

## Key Outcomes
- Full-featured CRUD for user records, matching the detailed user model and business rules.
- TypeScript-only codebase (frontend & backend).
- Modern, modular project structure.
- Robust validation, error handling, and user experience.

---

## Major Tasks (TODO)

### 1. **Refactor Project Structure**
- [ ] Organize frontend into `components/`, `pages/`, `types/`, `utils/`, `styles/` as per spec.
- [ ] Organize backend into `controllers/`, `services/`, `models/`, `routes/`, `middleware/`, `types/`, `utils/`.

### 2. **Expand User Model and Types**
- [ ] Update user entity to match:
```ts
interface User {
  id: string; // UUID
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  department: string;
  position: string;
  startDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```
- [ ] Add TypeScript types/interfaces in `types/`.

### 3. **Backend Refactor/Upgrade**
- [ ] Migrate backend to TypeScript + Express + TypeORM.
- [ ] Implement RESTful API at `/api/v1/users` with all endpoints, pagination, filtering, sorting, and correct response format.
- [ ] Add OpenAPI/Swagger documentation.
- [ ] Implement input validation middleware (Zod/Joi) for all endpoints.
- [ ] Add error handling middleware and logging.
- [ ] Ensure database schema matches user model and uses UUIDs.
- [ ] Add migration scripts for schema.

### 4. **Frontend Expansion & Refactor**
- [ ] Create modular pages: UserListPage, CreateUserPage, EditUserPage, UserDetailsPage, DashboardPage.
- [ ] Implement UserTable, UserForm, UserDetails, UserFilters as reusable components.
- [ ] Add styled-components and global theming.
- [ ] Implement advanced CRUD features:
  - [ ] Pagination, search, filter, sort, bulk delete.
  - [ ] Full user form with all fields and validations.
  - [ ] Real-time validation feedback.
  - [ ] Success/error toasts.
  - [ ] Loading states and error boundaries.
  - [ ] Accessibility (ARIA, keyboard navigation).
- [ ] Dashboard: charts (users by department/status), recent users, quick actions.

### 5. **Testing & Quality**
- [ ] Write unit/integration tests for backend (validation, endpoints).
- [ ] Write frontend tests (form validation, CRUD flows).
- [ ] Set up ESLint, Prettier, and strict TypeScript settings.

### 6. **Deployment & DevOps**
- [ ] Update Dockerfiles for frontend/backend (TypeScript build).
- [ ] Update docker-compose for new services and environment variables.
- [ ] Ensure .env files are used for all secrets/config.

---

## Dependencies
- Authentication epic completed
- Database service running

## Priority
High

## Notes
- Follow RESTful API and TypeScript best practices.
- Commit frequently with clear messages.
- Document all validation and business rules.
- Focus on code quality, maintainability, and user experience.

3 Story Points

---

## As an admin, I want to view, update, and delete user records

### Description
Enable full CRUD operations on user records, supporting business workflows and compliance requirements.

### Industry Best Practices
- Use RESTful API conventions
- Implement optimistic UI updates
- Log all changes for auditability
- Support soft deletes if required by compliance

### Acceptance Criteria
- [x] Users can be viewed, updated, and deleted via API and UI
- [x] All changes are logged for auditing
- [x] Bulk delete is transactional and auditable

### Potential Tasks
- [x] Implement CRUD endpoints and UI
- [x] Add audit logging for all changes
- [x] Support pagination, filtering, and search
- [x] Write CRUD operation tests

### Dependencies
- User creation implemented
- Auditing infrastructure in place

### Implementation
- Design RESTful API endpoints for retrieving, updating, and deleting users.
- Implement UI components for user listing, editing, and deletion.
- Add optimistic UI updates for a smooth user experience.
- Integrate audit logging for all user changes.
- Support soft delete functionality if required (e.g., mark users as inactive rather than deleting).
- Ensure bulk delete operations are transactional and auditable.
- Add pagination, filtering, and search to user listing.
- Write unit and integration tests for all CRUD operations.
- Document API endpoints and UI workflows.


### Priority
High

### Estimation
5 Story Points

---

## As an admin, I want to perform bulk actions on user records

### Description
Support bulk operations (e.g., delete, update) on user records to improve efficiency and support enterprise workflows.

### Industry Best Practices
- Use transactions for bulk operations
- Provide confirmation dialogs and undo options
- Log all bulk actions

### Acceptance Criteria
- [x] Bulk delete and update supported via API and UI
- [x] Operations are transactional and auditable
- [x] Users receive confirmation and feedback

### Potential Tasks
- [x] Implement bulk operation endpoints and UI
- [x] Add transactional support in backend
- [x] Write tests for bulk actions

### Dependencies
- CRUD operations implemented
- Auditing infrastructure in place

### Priority
Medium

### Estimation
3 Story Points

---

## As a developer, I want all CRUD operations to be covered by automated tests

### Description
Ensure all user management operations are tested automatically to guarantee reliability, security, and compliance.

### Industry Best Practices
- Use unit and integration tests
- Cover edge cases and error conditions
- Integrate tests with CI/CD pipeline

### Acceptance Criteria
- [x] Automated tests cover all CRUD flows
- [x] Tests run in CI/CD pipeline
- [x] Test failures block deployment

### Potential Tasks
- [x] Write unit and integration tests
- [x] Add tests to CI pipeline
- [x] Review test coverage regularly

### Dependencies
- CRUD features implemented

### Priority
High

### Estimation
2 Story Points
