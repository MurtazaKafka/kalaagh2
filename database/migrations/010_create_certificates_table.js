/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('certificates', function (table) {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE');
    table.string('certificate_number', 50).notNullable().unique();
    table.string('title', 255).notNullable();
    table.string('title_dari', 255);
    table.string('title_pashto', 255);
    table.text('description');
    table.text('description_dari');
    table.text('description_pashto');
    table.timestamp('issued_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at'); // Some certificates might expire
    table.decimal('final_score', 5, 2);
    table.string('grade', 10); // A+, A, B+, etc.
    table.text('certificate_url'); // URL to generated certificate PDF/image
    table.text('verification_url'); // Public URL for certificate verification
    table.string('verification_code', 20).notNullable().unique();
    table.boolean('is_valid').defaultTo(true);
    table.text('revocation_reason');
    table.timestamp('revoked_at');
    table.uuid('revoked_by').references('id').inTable('users');
    table.json('completion_data'); // Course completion statistics
    table.json('metadata');
    table.timestamps(true, true);

    table.index(['user_id']);
    table.index(['course_id']);
    table.index(['certificate_number']);
    table.index(['verification_code']);
    table.index(['issued_at']);
    table.index(['is_valid']);
    table.unique(['user_id', 'course_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('certificates');
};