require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/userdb',
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './migrations/seeds',
    },
    pool: { min: 2, max: 10 },
  },
  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL || 'postgres://user:password@localhost:5433/userdb_test',
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './migrations/seeds',
    },
    pool: { min: 1, max: 2 },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './migrations/seeds',
    },
    pool: { min: 2, max: 20 },
    ssl: { rejectUnauthorized: false },
  },
};
