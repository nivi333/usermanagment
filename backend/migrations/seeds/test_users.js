const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    {
      id: 1,
      email: 'admin@test.com',
      password: await bcrypt.hash('Password123', 10),
      role: 'admin'
    },
    {
      id: 2,
      email: 'user@test.com',
      password: await bcrypt.hash('Password123', 10),
      role: 'user'
    }
  ]);
};
