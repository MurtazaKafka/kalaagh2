/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('enrollments', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.timestamp('enrolled_at').defaultTo(knex.fn.now());
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.enum('status', ['enrolled', 'in_progress', 'completed', 'dropped']).defaultTo('enrolled');
    table.decimal('progress_percentage', 5, 2).defaultTo(0.00);
    table.integer('lessons_completed').defaultTo(0);
    table.integer('total_lessons').defaultTo(0);
    table.integer('total_time_spent_seconds').defaultTo(0);
    table.timestamp('last_accessed_at');
    table.uuid('current_lesson_id').references('id').inTable('lessons');
    table.decimal('grade', 5, 2); // Final grade/score
    table.json('metadata');
    table.timestamps(true, true);

    table.unique(['user_id', 'course_id']);
    table.index(['user_id']);
    table.index(['course_id']);
    table.index(['status']);
    table.index(['enrolled_at']);
    table.index(['completed_at']);
    table.index(['progress_percentage']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('enrollments');
};