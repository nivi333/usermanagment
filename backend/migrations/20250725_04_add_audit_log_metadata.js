exports.up = function(knex) {
  return knex.schema.alterTable('audit_logs', function(table) {
    table.jsonb('metadata').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('audit_logs', function(table) {
    table.dropColumn('metadata');
  });
};
