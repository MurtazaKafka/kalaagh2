/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('user_progress', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('resource_id').notNullable().references('id').inTable('content_items').onDelete('CASCADE');
    table.integer('progress_percentage').defaultTo(0);
    table.boolean('completed').defaultTo(false);
    table.text('notes');
    table.json('bookmarks'); // Array of { timestamp, note }
    table.json('quiz_scores'); // Array of quiz attempts and scores
    table.integer('time_spent_seconds').defaultTo(0);
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('last_accessed').defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();
    table.json('offline_sync_data'); // Track offline progress to sync
    table.timestamps(true, true);
    
    // Composite unique constraint
    table.unique(['user_id', 'resource_id']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['resource_id']);
    table.index(['completed']);
    table.index(['last_accessed']);
    table.index(['progress_percentage']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('user_progress');
};