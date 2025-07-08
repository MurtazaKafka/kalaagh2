/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  return knex.schema.createTable('users', function (table) {
    table.uuid('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.date('date_of_birth');
    table.enum('gender', ['female', 'male', 'other']).defaultTo('female');
    table.string('country', 100);
    table.string('city', 100);
    table.string('preferred_language', 10).defaultTo('en');
    table.enum('role', ['student', 'teacher', 'mentor', 'admin']).defaultTo('student');
    table.boolean('is_email_verified').defaultTo(false);
    table.string('email_verification_token', 255);
    table.timestamp('email_verification_expires_at');
    table.string('password_reset_token', 255);
    table.timestamp('password_reset_expires_at');
    table.text('profile_picture_url');
    table.text('bio');
    table.json('preferences');
    table.timestamp('last_login_at');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.index(['email']);
    table.index(['role']);
    table.index(['is_active']);
    table.index(['country']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.dropTable('users');
};