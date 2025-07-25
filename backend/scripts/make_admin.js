// Script to make nivetha22000@gmail.com an admin user
// Usage: node scripts/make_admin.js

const knexConfig = require('../knexfile');
const environment = process.env.NODE_ENV || 'development';
const knex = require('knex')(knexConfig[environment]);

async function makeAdmin() {
  try {
    const email = 'nivetha22000@gmail.com';
    const updated = await knex('users')
      .where({ email })
      .update({ role: 'admin' });
    if (updated) {
      console.log(`User ${email} is now an admin.`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (err) {
    console.error('Error updating user role:', err);
  } finally {
    await knex.destroy();
  }
}

makeAdmin();
