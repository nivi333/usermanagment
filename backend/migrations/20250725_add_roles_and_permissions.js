exports.up = function(knex) {
  return knex.schema
    .createTable('roles', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.string('description');
      table.timestamps(true, true);
    })
    .createTable('permissions', function(table) {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.string('description');
      table.timestamps(true, true);
    })
    .createTable('role_permissions', function(table) {
      table.increments('id').primary();
      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE');
      table.integer('permission_id').unsigned().references('id').inTable('permissions').onDelete('CASCADE');
      table.unique(['role_id', 'permission_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('role_permissions')
    .dropTableIfExists('permissions')
    .dropTableIfExists('roles');
};
