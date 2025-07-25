const jwt = require('jsonwebtoken');

// Use the same secret as your backend .env for tests
const TEST_SECRET = process.env.JWT_SECRET || 'testsecret';

/**
 * Generate a JWT for a test user with a given role.
 * @param {string} role 'admin' | 'user'
 * @returns {string} JWT
 */
function getTestToken(role) {
  const payload = {
    id: role === 'admin' ? 1 : 2,
    email: role === 'admin' ? 'admin@test.com' : 'user@test.com',
    role
  };
  return jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });
}

module.exports = { getTestToken };
