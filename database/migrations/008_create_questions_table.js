/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('questions', function (table) {
    table.uuid('id').primary();
    table.uuid('assessment_id').notNullable().references('id').inTable('assessments').onDelete('CASCADE');
    table.text('question_text').notNullable();
    table.text('question_text_dari');
    table.text('question_text_pashto');
    table.enum('question_type', ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching', 'ordering']).notNullable();
    table.json('options'); // Array of options for multiple choice, matching pairs, etc.
    table.json('correct_answers'); // Array of correct answers
    table.text('explanation');
    table.text('explanation_dari');
    table.text('explanation_pashto');
    table.integer('points').defaultTo(1);
    table.integer('order_in_assessment').notNullable();
    table.boolean('is_required').defaultTo(true);
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['assessment_id']);
    table.index(['question_type']);
    table.index(['order_in_assessment']);
    table.index(['points']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('questions');
};