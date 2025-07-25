exports.up = async function(knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
    RETURNS trigger AS $$
    BEGIN
      RAISE EXCEPTION 'Audit logs are immutable';
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS audit_logs_update_protect ON audit_logs;
    DROP TRIGGER IF EXISTS audit_logs_delete_protect ON audit_logs;

    CREATE TRIGGER audit_logs_update_protect
      BEFORE UPDATE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

    CREATE TRIGGER audit_logs_delete_protect
      BEFORE DELETE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();
  `);
};

exports.down = async function(knex) {
  await knex.raw(`
    DROP TRIGGER IF EXISTS audit_logs_update_protect ON audit_logs;
    DROP TRIGGER IF EXISTS audit_logs_delete_protect ON audit_logs;
    DROP FUNCTION IF EXISTS prevent_audit_log_modification();
  `);
};
