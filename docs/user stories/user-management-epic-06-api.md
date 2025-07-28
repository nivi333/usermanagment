# Epic 6: API Design & Documentation – User Stories

## As a developer, I want all endpoints documented in OpenAPI/Swagger

### Description
Document all API endpoints, schemas, and error codes in OpenAPI/Swagger to ensure clarity, maintainability, and ease of integration for internal and external consumers.

### Industry Best Practices
- Use OpenAPI 3.x standard
- Include example requests/responses
- Keep documentation in version control

### Acceptance Criteria
- [x] All endpoints are documented in Swagger/OpenAPI (openapi.yaml)
- [x] Example payloads and error codes provided
- [x] Swagger UI is integrated and available at `/docs`
- [ ] Documentation is versioned and updated with releases (ongoing)

### Implementation Progress
- [x] OpenAPI 3.0 spec created for all endpoints (auth, user CRUD, RBAC, permissions, audit log)
- [x] Example requests/responses and error codes included
- [x] Swagger UI integrated for live, interactive API docs at `/docs`
- [ ] Maintain and version documentation with future releases (To Do)

### Potential Tasks
- Review and update OpenAPI spec with new endpoints or changes
- Add more detailed examples as needed
- Ensure docs are versioned and updated with each release
- Maintain contract tests to ensure implementation matches documentation

### Contract/API Documentation Tests
- [x] Contract tests implemented using Jest, Supertest, and OpenAPI-Backend
- Test location: `backend/tests/contract/openapi-contract.test.ts`
- Tests verify every documented endpoint is implemented and responds as expected, and that the OpenAPI spec is valid
- All import and lint issues resolved; tests now pass successfully
- To run: `npx jest tests/contract/openapi-contract.test.ts` (backend must be running)
- If a test fails, review the error to fix either the implementation or documentation for alignment
- Next: Integrate into CI/CD to ensure future changes remain compliant

**Summary:**
- Contract tests now pass, guaranteeing that your backend implementation and OpenAPI documentation are in sync. This ensures audit/compliance requirements and smooth integration for consumers.

### Dependencies
- API endpoints implemented

### Priority
High

### Estimation
2 Story Points

---

## As a developer, I want API versioning enforced and documented

### Description
Implement and document API versioning (e.g., /api/v1) to support backward compatibility and safe evolution of the API.

### Industry Best Practices
- Version APIs via URL or headers
- Communicate deprecation timelines
- Test for backward compatibility

### Acceptance Criteria
- [x] API versioning is enforced and documented (all endpoints under `/api/v1`, OpenAPI/Swagger updated)
- [ ] Deprecation policy is published
- [x] Backward compatibility is tested (via contract tests)

### Implementation Summary
- All backend API endpoints are now served under `/api/v1` (e.g., `/api/v1/login`, `/api/v1/users`)
- Express uses a dedicated `apiV1` router for versioned endpoints
- OpenAPI/Swagger documentation and UI updated to reflect versioned base path
- Contract tests ensure implementation and documentation remain in sync

### Maintenance Guidance
- Add new endpoints to the `apiV1` router for v1
- For breaking changes, create an `apiV2` router and update the OpenAPI spec
- Keep contract tests and docs updated with each version

### Potential Tasks
- Implement and communicate deprecation policy for old versions
- Review versioning strategy with each major release
- Document versioning and deprecation policy
- Add tests for version compatibility

### Dependencies
- API endpoints implemented

### Priority
Medium

### Estimation
2 Story Points

---

## As a QA engineer, I want contract tests to ensure documentation matches implementation

### Description
Write and automate contract tests to verify that the API implementation conforms to its documentation, preventing drift and integration issues.

### Industry Best Practices
- Use contract testing tools (e.g., Dredd, Pact)
- Integrate tests in CI/CD pipeline
- Fail builds on contract test failures

### Acceptance Criteria
- [x] Contract tests cover all endpoints (see `backend/tests/contract/openapi-contract.test.ts`)
- [ ] Tests run in CI/CD pipeline
- [ ] Failures block deployment

### Implementation Summary
- Contract tests using Jest, Supertest, and OpenAPI-Backend are implemented and passing
- All documented endpoints are verified for implementation and response compliance
- OpenAPI spec validity is also checked

### CI/CD Integration Guidance
- Add the following step to your CI workflow (GitHub Actions, GitLab CI, etc.):
  ```sh
  cd backend && npx jest tests/contract/openapi-contract.test.ts
  ```
- Ensure this step runs after backend build and before deployment
- Configure your pipeline to fail if any contract test fails, blocking deployment

**Result:**
- API and documentation will remain in sync, preventing drift and integration issues
- Contract test failures will block deployment, ensuring release quality

### Potential Tasks
- Write contract tests for all endpoints
- Integrate tests in CI pipeline
- Review/update tests with API changes

### Dependencies
- API documentation and endpoints implemented

### Priority
High

### Estimation
2 Story Points
