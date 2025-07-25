# Epic 5: Auditing & Compliance – User Stories

## As a compliance officer, I want all critical actions to be logged with full context

### Description
Ensure that all sensitive operations (user CRUD, role changes, authentication events) are logged with sufficient detail to support regulatory compliance and forensic analysis.

### Industry Best Practices
- Use tamper-evident, centralized log storage
- Include who, what, when, and where for each event
- Retain logs per compliance requirements (e.g., GDPR, SOC2)

### Acceptance Criteria
- [x] All critical actions are logged with full context (user CRUD, role/permission changes, authentication, password reset)
- [x] Logs include user, action, timestamp, and metadata (IP, user agent, attempted email, etc.)
- [ ] Log retention meets compliance standards

### Implementation Progress
- [x] Audit logging integrated for user CRUD, role/permission changes, authentication events, and password reset
- [x] `audit_logs` schema extended with `metadata` JSON column for contextual details
- [x] Backend endpoints updated to insert audit log entries for all sensitive operations
- [ ] Log retention policy to be configured (To Do)
- [ ] Additional tests for logging coverage (To Do)

### Potential Tasks
- Extend audit logging to any new critical endpoints
- Finalize and automate log retention policies
- Expand test coverage for audit events

### Dependencies
- CRUD, RBAC, and authentication features implemented

### Priority
High

### Estimation
3 Story Points

---

## As an admin, I want audit logs to be immutable and protected from tampering

### Description
Store audit logs in a tamper-evident, centralized system to ensure their integrity and support compliance and investigations.

### Industry Best Practices
- Use append-only or WORM storage
- Restrict log access to authorized roles
- Monitor for suspicious log access or changes

### Acceptance Criteria
- [x] Audit logs are immutable and protected (API, DB permissions, triggers)
- [x] Only authorized users can access logs (admin-only endpoint)
- [ ] Alerts for suspicious log access (To Do)
  - Monitoring and alerting for unusual or unauthorized log access is not yet implemented. Recommended approaches: database audit triggers, application-level logging of audit log queries, or integration with SIEM/monitoring tools.

### Implementation Progress
- [x] No API endpoints exist for updating or deleting audit logs
- [x] Database permissions (migration) revoke UPDATE/DELETE on audit_logs for all users
- [x] PostgreSQL triggers block any update/delete attempts, raising an exception
- [x] Automated tests verify immutability
- [ ] Monitoring/alerts for suspicious log access (To Do)

### Potential Tasks
- Integrate log access monitoring and alerting (e.g., send alerts on non-admin access attempts, excessive log reads, or failed access)
- Periodically review DB permissions and trigger integrity
- Review log access patterns and perform compliance reviews regularly

### Dependencies
- Audit logging implemented

### Priority
High

### Estimation
2 Story Points

---

## As an auditor, I want APIs and UI for accessing audit logs with filtering and export

### Description
Provide secure APIs and UI components for authorized users to access, filter, and export audit logs for compliance and investigations.

### Industry Best Practices
- RBAC on log access endpoints
- Support filtering, pagination, and export (CSV/JSON)
- Log access to audit logs themselves

### Acceptance Criteria
- [x] APIs for audit log access (admin-only, RBAC enforced)
- [x] Filtering, pagination, and export (CSV/JSON) supported via query params
- [x] Access to logs is itself logged in audit_logs
- [ ] UI for audit log access (To Do)

### Implementation Progress
- [x] Backend /audit-log endpoint supports:
  - Filtering by action, user, date range
  - Pagination and total count
  - Export as CSV or JSON
  - Access logging (every read is itself logged with filters, export type, admin, IP, user agent)
- [ ] Frontend UI for audit log viewing, filtering, and export (To Do)

### Potential Tasks
- Implement audit log endpoints and UI
- Add filtering, pagination, and export features
- Log all access to audit logs
- Write tests for log access flows

### Dependencies
- Audit logs stored and protected
- RBAC enforced

### Priority
Medium

### Estimation
3 Story Points
