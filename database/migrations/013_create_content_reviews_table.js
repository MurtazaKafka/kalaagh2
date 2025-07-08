/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('content_reviews', function (table) {
    table.uuid('id').primary();
    table.uuid('content_id').notNullable().references('id').inTable('content_items').onDelete('CASCADE');
    table.uuid('reviewer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['pending', 'approved', 'rejected', 'needs_revision']).defaultTo('pending');
    table.decimal('quality_score', 3, 2).defaultTo(0.00);
    table.decimal('educational_value', 3, 2).defaultTo(0.00);
    table.decimal('cultural_appropriateness', 3, 2).defaultTo(0.00);
    table.decimal('technical_quality', 3, 2).defaultTo(0.00);
    table.text('notes');
    table.json('suggestions'); // Array of improvement suggestions
    table.timestamp('reviewed_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.index(['content_id']);
    table.index(['reviewer_id']);
    table.index(['status']);
    table.index(['reviewed_at']);
    table.index(['quality_score']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('content_reviews');
};