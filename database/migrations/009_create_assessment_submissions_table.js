/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('assessment_submissions', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('assessment_id').notNullable().references('id').inTable('assessments').onDelete('CASCADE');
    table.integer('attempt_number').notNullable();
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('submitted_at');
    table.enum('status', ['in_progress', 'submitted', 'graded', 'expired']).defaultTo('in_progress');
    table.json('answers'); // Array of answer objects {question_id, answer, is_correct}
    table.decimal('score', 5, 2).defaultTo(0.00);
    table.decimal('percentage', 5, 2).defaultTo(0.00);
    table.integer('total_points').defaultTo(0);
    table.integer('earned_points').defaultTo(0);
    table.integer('time_spent_seconds').defaultTo(0);
    table.boolean('is_passed').defaultTo(false);
    table.text('feedback');
    table.uuid('graded_by').references('id').inTable('users');
    table.timestamp('graded_at');
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['user_id']);
    table.index(['assessment_id']);
    table.index(['attempt_number']);
    table.index(['status']);
    table.index(['submitted_at']);
    table.index(['score']);
    table.index(['is_passed']);
    table.unique(['user_id', 'assessment_id', 'attempt_number']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('assessment_submissions');
};