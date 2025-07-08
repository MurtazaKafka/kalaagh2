/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('curriculum_mappings', function (table) {
    table.uuid('id').primary();
    table.uuid('content_id').notNullable().references('id').inTable('content_items').onDelete('CASCADE');
    table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.string('grade_level', 20).notNullable();
    table.string('unit', 100).notNullable();
    table.string('chapter', 100).notNullable();
    table.string('lesson', 100).notNullable();
    table.integer('order_in_sequence').notNullable();
    table.boolean('is_core').defaultTo(true);
    table.decimal('estimated_time_hours', 5, 2).defaultTo(0.00);
    table.json('prerequisites'); // Array of prerequisite content IDs
    table.json('learning_outcomes'); // Array of specific learning outcomes
    table.timestamps(true, true);

    table.index(['content_id']);
    table.index(['subject_id']);
    table.index(['grade_level']);
    table.index(['unit']);
    table.index(['chapter']);
    table.index(['order_in_sequence']);
    table.index(['is_core']);
    table.unique(['content_id', 'subject_id', 'grade_level']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('curriculum_mappings');
};