exports.up = async function(knex) {
  // Replace 'user' with your actual DB user if needed
  await knex.raw(`
    REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
    REVOKE UPDATE, DELETE ON "user";
    -- Optionally, REVOKE UPDATE, DELETE FROM your_app_user;
  `);
};

exports.down = async function(knex) {
  // Grant back privileges if needed (for rollback)
  await knex.raw(`
    GRANT UPDATE, DELETE ON audit_logs TO PUBLIC;
    GRANT UPDATE, DELETE ON audit_logs TO "user";
    -- Optionally, GRANT UPDATE, DELETE TO your_app_user;
  `);
};
