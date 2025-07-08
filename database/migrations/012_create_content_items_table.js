/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('content_items', function (table) {
    table.uuid('id').primary();
    table.uuid('source_id').notNullable().references('id').inTable('content_sources').onDelete('CASCADE');
    table.string('external_id', 255).notNullable();
    table.string('title', 500).notNullable();
    table.string('title_dari', 500);
    table.string('title_pashto', 500);
    table.text('description');
    table.text('description_dari');
    table.text('description_pashto');
    table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.string('grade_level', 20).notNullable();
    table.enum('content_type', ['video', 'article', 'exercise', 'interactive']).defaultTo('video');
    table.enum('difficulty', ['beginner', 'intermediate', 'advanced']).defaultTo('beginner');
    table.integer('duration_seconds').defaultTo(0);
    table.text('video_url');
    table.text('thumbnail_url');
    table.json('subtitles'); // Array of subtitle tracks
    table.text('transcript');
    table.text('transcript_dari');
    table.text('transcript_pashto');
    table.json('tags'); // Array of tags
    table.json('prerequisites'); // Array of prerequisite content IDs
    table.json('learning_objectives'); // Array of learning objectives
    table.boolean('is_processed').defaultTo(false);
    table.boolean('is_approved').defaultTo(false);
    table.decimal('quality_score', 3, 2).defaultTo(0.00);
    table.text('review_notes');
    table.timestamp('imported_at').defaultTo(knex.fn.now());
    table.timestamp('last_updated_at').defaultTo(knex.fn.now());
    table.json('metadata');
    table.timestamps(true, true);

    table.unique(['source_id', 'external_id']);
    table.index(['source_id']);
    table.index(['subject_id']);
    table.index(['grade_level']);
    table.index(['content_type']);
    table.index(['difficulty']);
    table.index(['is_processed']);
    table.index(['is_approved']);
    table.index(['quality_score']);
    table.index(['imported_at']);
    table.index(['title']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('content_items');
};