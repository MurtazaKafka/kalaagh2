/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('assessments', function (table) {
    table.uuid('id').primary();
    table.uuid('course_id').references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('lesson_id').references('id').inTable('lessons').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.string('title_dari', 255);
    table.string('title_pashto', 255);
    table.text('description');
    table.text('description_dari');
    table.text('description_pashto');
    table.text('instructions');
    table.text('instructions_dari');
    table.text('instructions_pashto');
    table.enum('assessment_type', ['quiz', 'exam', 'assignment', 'project']).defaultTo('quiz');
    table.integer('time_limit_minutes').defaultTo(0); // 0 means no time limit
    table.integer('max_attempts').defaultTo(1);
    table.decimal('passing_score', 5, 2).defaultTo(70.00);
    table.integer('total_points').defaultTo(100);
    table.boolean('randomize_questions').defaultTo(false);
    table.boolean('show_correct_answers').defaultTo(true);
    table.boolean('show_score_immediately').defaultTo(true);
    table.boolean('is_published').defaultTo(false);
    table.timestamp('available_from');
    table.timestamp('available_until');
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['course_id']);
    table.index(['lesson_id']);
    table.index(['created_by']);
    table.index(['assessment_type']);
    table.index(['is_published']);
    table.index(['available_from']);
    table.index(['available_until']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('assessments');
};