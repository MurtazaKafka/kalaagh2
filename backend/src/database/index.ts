import knex from 'knex';
import knexConfig from '../../../database/knexfile.js';
import { config } from '../utils/config.js';

// Initialize database connection
export const db = knex(knexConfig[config.nodeEnv]);

// Export for use in services
export default db;