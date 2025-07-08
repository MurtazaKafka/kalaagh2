import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('content_sources').del();
  
  // Insert seed entries
  await knex('content_sources').insert([
    {
      id: uuidv4(),
      name: 'Khan Academy',
      base_url: 'https://www.khanacademy.org/api/v1',
      api_key: null,
      is_active: true,
      total_content: 0,
      imported_content: 0,
      metadata: JSON.stringify({
        description: 'World-class education for anyone, anywhere',
        subjects: ['math', 'science', 'computing', 'arts-humanities', 'economics-finance-domain'],
        languages: ['en'],
        contentTypes: ['video', 'exercise', 'article']
      })
    },
    {
      id: uuidv4(),
      name: 'MIT OpenCourseWare',
      base_url: 'https://ocw.mit.edu',
      api_key: null,
      is_active: true,
      total_content: 0,
      imported_content: 0,
      metadata: JSON.stringify({
        description: 'MIT courses, freely available online',
        subjects: ['math', 'science', 'engineering', 'humanities'],
        languages: ['en'],
        contentTypes: ['video', 'article', 'exercise']
      })
    },
    {
      id: uuidv4(),
      name: 'Coursera Open Content',
      base_url: 'https://www.coursera.org',
      api_key: null,
      is_active: false, // Disabled by default until API setup
      total_content: 0,
      imported_content: 0,
      metadata: JSON.stringify({
        description: 'Open educational content from Coursera',
        subjects: ['math', 'science', 'computing', 'humanities'],
        languages: ['en', 'multiple'],
        contentTypes: ['video', 'article', 'exercise']
      })
    },
    {
      id: uuidv4(),
      name: 'Custom Kalaagh Content',
      base_url: 'https://content.kalaagh.org',
      api_key: null,
      is_active: true,
      total_content: 0,
      imported_content: 0,
      metadata: JSON.stringify({
        description: 'Custom educational content created specifically for Afghan students',
        subjects: ['math', 'science', 'language-arts', 'social-studies', 'life-skills'],
        languages: ['en', 'dari', 'pashto'],
        contentTypes: ['video', 'article', 'interactive'],
        culturallyAdapted: true
      })
    }
  ]);
};