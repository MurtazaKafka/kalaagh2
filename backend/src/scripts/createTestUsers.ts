import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import knex from 'knex';
import knexConfig from '../../../database/knexfile.js';
import { config } from '../utils/config.js';

const db = knex(knexConfig[config.nodeEnv]);

const testUsers = [
  {
    id: uuidv4(),
    email: 'student@test.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'Student',
    role: 'student',
    preferred_language: 'en',
    gender: 'female' as const,
  },
  {
    id: uuidv4(),
    email: 'teacher@test.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'Teacher',
    role: 'teacher',
    preferred_language: 'fa',
    gender: 'female' as const,
  },
  {
    id: uuidv4(),
    email: 'admin@test.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'Admin',
    role: 'admin',
    preferred_language: 'en',
    gender: 'female' as const,
  },
];

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users...');

    // Delete existing test users
    await db('users')
      .whereIn('email', testUsers.map(u => u.email))
      .del();

    // Create new test users
    for (const userData of testUsers) {
      const password_hash = await bcrypt.hash(userData.password, config.bcryptSaltRounds);
      
      const { password, ...userWithoutPassword } = userData;
      
      await db('users').insert({
        ...userWithoutPassword,
        password_hash,
        is_email_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log(`✅ Created ${userData.role}: ${userData.email} (password: ${userData.password})`);
    }

    console.log('\n✨ Test users created successfully!');
    console.log('\nYou can now login with:');
    testUsers.forEach(user => {
      console.log(`  📧 ${user.email} / 🔑 ${user.password} (${user.role})`);
    });

    await db.destroy();
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    await db.destroy();
    process.exit(1);
  }
}

createTestUsers();