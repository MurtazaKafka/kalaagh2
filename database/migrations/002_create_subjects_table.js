/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('subjects', function (table) {
    table.uuid('id').primary();
    table.string('name', 100).notNullable();
    table.string('name_dari', 100);
    table.string('name_pashto', 100);
    table.text('description');
    table.text('description_dari');
    table.text('description_pashto');
    table.string('icon', 100);
    table.string('color', 7).defaultTo('#d67719');
    table.integer('sort_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index(['name']);
    table.index(['is_active']);
    table.index(['sort_order']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('subjects');
};