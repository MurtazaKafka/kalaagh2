/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('offline_content_queue', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('content_id').notNullable().references('id').inTable('content_items').onDelete('CASCADE');
    table.enum('status', ['pending', 'downloading', 'completed', 'failed', 'cancelled']).defaultTo('pending');
    table.enum('priority', ['high', 'medium', 'low']).defaultTo('medium');
    table.enum('quality', ['high', 'medium', 'low', 'audio_only']).defaultTo('medium');
    table.integer('download_progress').defaultTo(0);
    table.integer('file_size_mb').nullable();
    table.integer('downloaded_mb').defaultTo(0);
    table.text('error_message').nullable();
    table.integer('retry_count').defaultTo(0);
    table.timestamp('queued_at').defaultTo(knex.fn.now());
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.json('metadata'); // Store additional download info
    table.timestamps(true, true);
    
    // Composite unique constraint
    table.unique(['user_id', 'content_id', 'quality']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['content_id']);
    table.index(['status']);
    table.index(['priority']);
    table.index(['queued_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('offline_content_queue');
};