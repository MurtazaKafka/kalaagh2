/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('lesson_progress', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('lesson_id').notNullable().references('id').inTable('lessons').onDelete('CASCADE');
    table.uuid('enrollment_id').notNullable().references('id').inTable('enrollments').onDelete('CASCADE');
    table.enum('status', ['not_started', 'in_progress', 'completed']).defaultTo('not_started');
    table.decimal('progress_percentage', 5, 2).defaultTo(0.00);
    table.integer('time_spent_seconds').defaultTo(0);
    table.integer('video_position_seconds').defaultTo(0); // Last watched position
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('last_accessed_at');
    table.integer('attempt_count').defaultTo(0);
    table.json('notes'); // Student notes for this lesson
    table.json('bookmarks'); // Timestamps of bookmarked moments
    table.json('metadata');
    table.timestamps(true, true);

    table.unique(['user_id', 'lesson_id']);
    table.index(['user_id']);
    table.index(['lesson_id']);
    table.index(['enrollment_id']);
    table.index(['status']);
    table.index(['completed_at']);
    table.index(['last_accessed_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('lesson_progress');
};