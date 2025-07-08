/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  // Add new columns to content_items table for enhanced resource management
  return knex.schema.alterTable('content_items', function (table) {
    // IB Programme mapping
    table.enum('ib_programme', ['PYP', 'MYP', 'DP']).nullable();
    table.string('ib_unit', 100).nullable();
    
    // Offline support
    table.string('offline_path', 500).nullable();
    table.integer('download_size_mb').nullable();
    table.boolean('offline_available').defaultTo(false);
    table.boolean('requires_internet').defaultTo(true);
    
    // Enhanced multilingual support
    table.json('language_available').nullable(); // ['en', 'fa', 'ps']
    
    // License and attribution
    table.string('license_type', 50).nullable();
    table.text('attribution').nullable();
    table.string('author', 255).nullable();
    table.string('source_url', 500).nullable();
    
    // Interactive content support
    table.boolean('interactive').defaultTo(false);
    table.json('interactive_data').nullable(); // Store simulation configs, etc.
    
    // Cultural adaptation
    table.text('cultural_notes').nullable();
    table.json('cultural_flags').nullable(); // Sensitive topics flagged
    table.boolean('cultural_review_required').defaultTo(false);
    
    // Enhanced metadata
    table.json('video_qualities').nullable(); // Available video quality options
    table.json('bookmarks').nullable(); // User bookmarks structure
    
    // Indexes for new fields
    table.index(['ib_programme']);
    table.index(['ib_unit']);
    table.index(['offline_available']);
    table.index(['license_type']);
    table.index(['cultural_review_required']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  return knex.schema.alterTable('content_items', function (table) {
    // Remove indexes
    table.dropIndex(['ib_programme']);
    table.dropIndex(['ib_unit']);
    table.dropIndex(['offline_available']);
    table.dropIndex(['license_type']);
    table.dropIndex(['cultural_review_required']);
    
    // Remove columns
    table.dropColumn('ib_programme');
    table.dropColumn('ib_unit');
    table.dropColumn('offline_path');
    table.dropColumn('download_size_mb');
    table.dropColumn('offline_available');
    table.dropColumn('requires_internet');
    table.dropColumn('language_available');
    table.dropColumn('license_type');
    table.dropColumn('attribution');
    table.dropColumn('author');
    table.dropColumn('source_url');
    table.dropColumn('interactive');
    table.dropColumn('interactive_data');
    table.dropColumn('cultural_notes');
    table.dropColumn('cultural_flags');
    table.dropColumn('cultural_review_required');
    table.dropColumn('video_qualities');
    table.dropColumn('bookmarks');
  });
};