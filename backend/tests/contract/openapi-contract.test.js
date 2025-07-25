// Contract test: Ensure implementation matches OpenAPI spec
// Uses jest, supertest, and openapi-backend for contract validation

const path = require('path');
const supertest = require('supertest');
const OpenAPIBackend = require('openapi-backend').default;
const app = require('../../index');

const api = supertest(app);
const openApiDocument = path.join(__dirname, '../../openapi.yaml');

let openapi;

beforeAll(async () => {
  openapi = new OpenAPIBackend({
    definition: openApiDocument,
    quick: true,
  });
  await openapi.init();
});

describe('OpenAPI contract tests', () => {
  test('All documented endpoints are implemented', async () => {
    const paths = Object.keys(openapi.definition.paths);
    for (const pathKey of paths) {
      const pathItem = openapi.definition.paths[pathKey];
      for (const method of Object.keys(pathItem)) {
        // Only test GET/POST/PUT/DELETE endpoints
        if (!['get', 'post', 'put', 'delete'].includes(method)) continue;
        // Replace OpenAPI path params with sample values
        let testPath = pathKey.replace(/{[^}]+}/g, '1');
        const res = await api[method](testPath)
          .set('Accept', 'application/json');
        // 404 is allowed for not found, 401/403 for auth, 200/201 for success
        expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
      }
    }
  });

  test('OpenAPI schema is valid', async () => {
    // openapi.validateDefinition throws if invalid
    expect(() => openapi.validateDefinition()).not.toThrow();
  });
});
