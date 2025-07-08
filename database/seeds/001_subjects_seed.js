import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('subjects').del();
  
  // Insert seed entries
  await knex('subjects').insert([
    {
      id: uuidv4(),
      name: 'Mathematics',
      name_dari: 'ریاضی',
      name_pashto: 'شمیر پوهنه',
      description: 'Complete K-12 Mathematics curriculum including arithmetic, algebra, geometry, and calculus',
      description_dari: 'کامل د K-12 د ریاضی نصاب د حساب، الجبرا، هندسه، او حساب په شمول',
      description_pashto: 'د K-12 بشپړ د شمیرپوهنې نصاب د حساب، الجبرا، هندسه، او حساب په شمول',
      icon: 'calculator',
      color: '#3B82F6',
      sort_order: 1,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Science',
      name_dari: 'علوم',
      name_pashto: 'ساینس',
      description: 'Biology, Chemistry, Physics and Earth Sciences',
      description_dari: 'بیولوژی، کیمیا، فزیک او د ځمکې علوم',
      description_pashto: 'ژونپوهنه، کیمیا، فزیک او د ځمکې علوم',
      icon: 'microscope',
      color: '#10B981',
      sort_order: 2,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Language Arts',
      name_dari: 'زبان او ادبیات',
      name_pashto: 'د ژبې هنرونه',
      description: 'Reading, Writing, Grammar, and Literature',
      description_dari: 'لوستل، لیکل، ګرامر، او ادبیات',
      description_pashto: 'لوستل، لیکل، ګرامر، او ادبیات',
      icon: 'book-open',
      color: '#8B5CF6',
      sort_order: 3,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Social Studies',
      name_dari: 'علوم اجتماعی',
      name_pashto: 'ټولنیزې زده کړې',
      description: 'History, Geography, Civics, and Economics',
      description_dari: 'تاریخ، جغرافیه، مدنی علوم، او اقتصاد',
      description_pashto: 'تاریخ، جغرافیه، مدنی علوم، او اقتصاد',
      icon: 'globe',
      color: '#F59E0B',
      sort_order: 4,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Computer Science',
      name_dari: 'علوم کامپیوتر',
      name_pashto: 'د کمپیوټر ساینس',
      description: 'Programming, Digital Literacy, and Technology Skills',
      description_dari: 'پروګرامینګ، ډیجیټل سواد، او ټیکنالوژۍ مهارتونه',
      description_pashto: 'پروګرامینګ، ډیجیټل سواد، او ټیکنالوژۍ مهارتونه',
      icon: 'monitor',
      color: '#6366F1',
      sort_order: 5,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Life Skills',
      name_dari: 'د ژوند مهارتونه',
      name_pashto: 'د ژوند مهارتونه',
      description: 'Health, Safety, and Practical Life Skills',
      description_dari: 'روغتیا، خوندیتوب، او د ژوند عملي مهارتونه',
      description_pashto: 'روغتیا، خوندیتوب، او د ژوند عملي مهارتونه',
      icon: 'heart',
      color: '#EF4444',
      sort_order: 6,
      is_active: true
    }
  ]);
};