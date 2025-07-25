exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.string('role').notNullable().defaultTo('user');
      table.timestamps(true, true);
    })
    .createTable('audit_logs', function(table) {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users');
      table.string('action').notNullable();
      table.string('old_role');
      table.string('new_role');
      table.string('changed_by');
      table.timestamp('timestamp').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('users');
};
