/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('translation_requests', function (table) {
    table.uuid('id').primary();
    table.uuid('content_id').notNullable().references('id').inTable('content_items').onDelete('CASCADE');
    table.enum('target_language', ['fa', 'ps']).notNullable(); // fa=Dari, ps=Pashto
    table.enum('translation_type', ['title', 'description', 'transcript', 'subtitles']).notNullable();
    table.enum('status', ['pending', 'in_progress', 'completed', 'reviewed', 'rejected']).defaultTo('pending');
    table.enum('method', ['machine', 'community', 'professional']).defaultTo('community');
    table.text('original_text').notNullable();
    table.text('translated_text').nullable();
    table.uuid('translator_id').nullable().references('id').inTable('users');
    table.uuid('reviewer_id').nullable().references('id').inTable('users');
    table.decimal('quality_score', 3, 2).nullable();
    table.text('review_notes').nullable();
    table.timestamp('requested_at').defaultTo(knex.fn.now());
    table.timestamp('completed_at').nullable();
    table.timestamp('reviewed_at').nullable();
    table.json('metadata'); // Store additional translation info
    table.timestamps(true, true);
    
    // Composite unique constraint
    table.unique(['content_id', 'target_language', 'translation_type']);
    
    // Indexes
    table.index(['content_id']);
    table.index(['target_language']);
    table.index(['status']);
    table.index(['translator_id']);
    table.index(['reviewer_id']);
    table.index(['requested_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('translation_requests');
};