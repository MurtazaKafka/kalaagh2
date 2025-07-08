/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('courses', function (table) {
    table.uuid('id').primary();
    table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.string('title_dari', 255);
    table.string('title_pashto', 255);
    table.text('description');
    table.text('description_dari');
    table.text('description_pashto');
    table.string('grade_level', 20).notNullable(); // K, 1, 2, ..., 12
    table.enum('difficulty', ['beginner', 'intermediate', 'advanced']).defaultTo('beginner');
    table.integer('estimated_duration_hours').defaultTo(0);
    table.text('thumbnail_url');
    table.text('preview_video_url');
    table.json('learning_objectives');
    table.json('prerequisites');
    table.decimal('price', 10, 2).defaultTo(0.00);
    table.boolean('is_free').defaultTo(true);
    table.boolean('is_published').defaultTo(false);
    table.boolean('is_featured').defaultTo(false);
    table.integer('enrollment_count').defaultTo(0);
    table.decimal('rating_average', 3, 2).defaultTo(0.00);
    table.integer('rating_count').defaultTo(0);
    table.string('external_source', 50); // 'khan_academy', 'coursera', 'custom', etc.
    table.string('external_id', 255);
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['subject_id']);
    table.index(['created_by']);
    table.index(['grade_level']);
    table.index(['difficulty']);
    table.index(['is_published']);
    table.index(['is_featured']);
    table.index(['is_free']);
    table.index(['external_source']);
    table.index(['rating_average']);
    table.index(['enrollment_count']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('courses');
};