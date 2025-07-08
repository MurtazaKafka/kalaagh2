/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('lessons', function (table) {
    table.uuid('id').primary();
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.string('title_dari', 255);
    table.string('title_pashto', 255);
    table.text('description');
    table.text('description_dari');
    table.text('description_pashto');
    table.text('content'); // HTML content for the lesson
    table.text('content_dari');
    table.text('content_pashto');
    table.integer('order_in_course').notNullable();
    table.integer('duration_seconds').defaultTo(0);
    table.text('video_url');
    table.text('video_thumbnail_url');
    table.json('video_subtitles'); // Array of subtitle objects with language and URL
    table.text('audio_url');
    table.json('resources'); // Array of additional resources (PDFs, links, etc.)
    table.enum('lesson_type', ['video', 'reading', 'interactive', 'assessment']).defaultTo('video');
    table.boolean('is_published').defaultTo(false);
    table.boolean('is_preview').defaultTo(false); // Can be viewed without enrollment
    table.string('external_source', 50);
    table.string('external_id', 255);
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['course_id']);
    table.index(['created_by']);
    table.index(['order_in_course']);
    table.index(['lesson_type']);
    table.index(['is_published']);
    table.index(['is_preview']);
    table.index(['external_source']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('lessons');
};