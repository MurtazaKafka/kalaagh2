/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('content_sources', function (table) {
    table.uuid('id').primary();
    table.string('name', 100).notNullable().unique();
    table.string('base_url', 500).notNullable();
    table.text('api_key');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_sync_at');
    table.integer('total_content').defaultTo(0);
    table.integer('imported_content').defaultTo(0);
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['name']);
    table.index(['is_active']);
    table.index(['last_sync_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('content_sources');
};