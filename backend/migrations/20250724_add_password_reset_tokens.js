exports.up = function(knex) {
  return knex.schema.createTable('password_reset_tokens', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').notNullable().defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('password_reset_tokens');
};
