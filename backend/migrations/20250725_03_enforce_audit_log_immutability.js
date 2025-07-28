exports.up = async function(knex) {
  // Replace 'user' with your actual DB user if needed
  await knex.raw(`REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;`);
  await knex.raw(`REVOKE UPDATE, DELETE ON users FROM PUBLIC;`);
};

exports.down = async function(knex) {
  // Grant back privileges if needed (for rollback)
  await knex.raw(`GRANT UPDATE, DELETE ON audit_logs TO PUBLIC;`);
  await knex.raw(`GRANT UPDATE, DELETE ON users TO PUBLIC;`);
};
