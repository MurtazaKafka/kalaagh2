import { v4 as uuidv4 } from 'uuid';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  // Clear existing data
  await knex('user_courses').del();
  await knex('lessons').del();
  await knex('courses').del();
  await knex('subjects').del();
  await knex('users').whereNot('email', 'admin@kalaagh.org').del();

  // Insert subjects
  const subjects = [
    {
      id: uuidv4(),
      name: 'Mathematics',
      name_dari: 'ریاضیات',
      name_pashto: 'رياضيات',
      description: 'Study of numbers, shapes, and patterns',
      description_dari: 'مطالعه اعداد، اشکال و الگوها',
      description_pashto: 'د شمېرو، شکلونو او نمونو مطالعه',
      icon: '🔢',
      color: '#D32011',
      sort_order: 1,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Science',
      name_dari: 'علوم',
      name_pashto: 'ساینس',
      description: 'Understanding the natural world',
      description_dari: 'درک جهان طبیعی',
      description_pashto: 'د طبیعي نړۍ پوهه',
      icon: '🔬',
      color: '#007A36',
      sort_order: 2,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'English',
      name_dari: 'انگلیسی',
      name_pashto: 'انګلیسي',
      description: 'English language and literature',
      description_dari: 'زبان و ادبیات انگلیسی',
      description_pashto: 'انګلیسي ژبه او ادبیات',
      icon: '📚',
      color: '#26619C',
      sort_order: 3,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'History',
      name_dari: 'تاریخ',
      name_pashto: 'تاریخ',
      description: 'Study of past events and civilizations',
      description_dari: 'مطالعه رویدادها و تمدن‌های گذشته',
      description_pashto: 'د تېرو پېښو او تمدنونو مطالعه',
      icon: '🏛️',
      color: '#8B0000',
      sort_order: 4,
      is_active: true
    },
    {
      id: uuidv4(),
      name: 'Geography',
      name_dari: 'جغرافیا',
      name_pashto: 'جغرافیه',
      description: 'Study of Earth and its features',
      description_dari: 'مطالعه زمین و ویژگی‌های آن',
      description_pashto: 'د ځمکې او د هغې د ځانګړتیاوو مطالعه',
      icon: '🌍',
      color: '#FF8C00',
      sort_order: 5,
      is_active: true
    }
  ];

  await knex('subjects').insert(subjects);

  // Get admin user ID (assuming one exists)
  const [adminUser] = await knex('users').where('email', 'admin@kalaagh.org').select('id');
  const adminId = adminUser?.id || uuidv4();

  // If admin doesn't exist, create one
  if (!adminUser) {
    await knex('users').insert({
      id: adminId,
      email: 'admin@kalaagh.org',
      name: 'Admin User',
      role: 'admin',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Insert courses
  const courses = [
    {
      id: uuidv4(),
      subject_id: subjects[0].id, // Mathematics
      created_by: adminId,
      title: 'Mathematics Grade 5',
      title_dari: 'ریاضیات صنف پنجم',
      title_pashto: 'د پنځم ټولګي رياضيات',
      description: 'Comprehensive mathematics course covering arithmetic, geometry, and problem-solving for grade 5 students aligned with Afghan curriculum.',
      description_dari: 'دوره جامع ریاضیات شامل حساب، هندسه و حل مسئله برای دانش آموزان صنف پنجم مطابق با نصاب تعلیمی افغانستان.',
      description_pashto: 'د افغانستان د تعليمي نصاب سره سم د پنځم ټولګي زده کوونکو لپاره د حساب، هندسې او د مسئلې حل جامع رياضياتو کورس.',
      grade_level: '5',
      difficulty: 'beginner',
      estimated_duration_hours: 120,
      thumbnail_url: '/images/math-5.jpg',
      learning_objectives: JSON.stringify([
        'Master basic arithmetic operations',
        'Understand geometric shapes and measurements',
        'Develop problem-solving skills'
      ]),
      is_published: true,
      is_featured: true
    },
    {
      id: uuidv4(),
      subject_id: subjects[1].id, // Science
      created_by: adminId,
      title: 'Science Grade 6',
      title_dari: 'علوم صنف ششم',
      title_pashto: 'د شپږم ټولګي ساینس',
      description: 'Explore the natural world through physics, chemistry, and biology concepts appropriate for grade 6 students.',
      description_dari: 'کشف جهان طبیعی از طریق مفاهیم فیزیک، کیمیا و بیولوژی مناسب برای دانش آموزان صنف ششم.',
      description_pashto: 'د شپږم ټولګي زده کوونکو لپاره د فزیک، کیمیا او بیولوژۍ مفاهیمو له لارې د طبیعي نړۍ کشف.',
      grade_level: '6',
      difficulty: 'beginner',
      estimated_duration_hours: 100,
      thumbnail_url: '/images/science-6.jpg',
      is_published: true,
      enrollment_count: 45
    },
    {
      id: uuidv4(),
      subject_id: subjects[2].id, // English
      created_by: adminId,
      title: 'English Language Arts Grade 7',
      title_dari: 'زبان انگلیسی صنف هفتم',
      title_pashto: 'د اووم ټولګي انګلیسي',
      description: 'Develop reading, writing, speaking, and listening skills in English through engaging content and activities.',
      description_dari: 'توسعه مهارت‌های خواندن، نوشتن، صحبت کردن و گوش دادن به زبان انگلیسی از طریق محتوا و فعالیت‌های جذاب.',
      description_pashto: 'د ښکیلو مطالبو او فعالیتونو له لارې په انګلیسي کې د لوستلو، لیکلو، خبرو کولو او اورېدلو مهارتونو پراختیا.',
      grade_level: '7',
      difficulty: 'intermediate',
      estimated_duration_hours: 150,
      thumbnail_url: '/images/english-7.jpg',
      is_published: true,
      is_featured: true,
      enrollment_count: 120
    },
    {
      id: uuidv4(),
      subject_id: subjects[3].id, // History
      created_by: adminId,
      title: 'History of Afghanistan',
      title_dari: 'تاریخ افغانستان',
      title_pashto: 'د افغانستان تاریخ',
      description: 'Learn about the rich history and cultural heritage of Afghanistan from ancient times to the present day.',
      description_dari: 'آشنایی با تاریخ غنی و میراث فرهنگی افغانستان از دوران باستان تا امروز.',
      description_pashto: 'د لرغونو وختونو څخه تر نن ورځې پورې د افغانستان د بډایه تاریخ او کلتوري میراث په اړه زده کړه.',
      grade_level: '8',
      difficulty: 'intermediate',
      estimated_duration_hours: 80,
      thumbnail_url: '/images/history-8.jpg',
      is_published: true,
      enrollment_count: 75
    },
    {
      id: uuidv4(),
      subject_id: subjects[0].id, // Mathematics
      created_by: adminId,
      title: 'Advanced Algebra',
      title_dari: 'جبر پیشرفته',
      title_pashto: 'پرمختللی الجبر',
      description: 'Master algebraic concepts including equations, functions, and graphing for high school students.',
      description_dari: 'تسلط بر مفاهیم جبری شامل معادلات، توابع و رسم نمودار برای دانش آموزان لیسه.',
      description_pashto: 'د لیسې زده کوونکو لپاره د معادلاتو، فنکشنونو او ګرافونو په ګډون د الجبري مفاهیمو تسلط.',
      grade_level: '10',
      difficulty: 'advanced',
      estimated_duration_hours: 180,
      thumbnail_url: '/images/algebra-10.jpg',
      is_published: true,
      enrollment_count: 200
    }
  ];

  await knex('courses').insert(courses);

  // Insert sample lessons for the first course
  const mathLessons = [
    {
      id: uuidv4(),
      course_id: courses[0].id,
      title: 'Introduction to Numbers',
      title_dari: 'آشنایی با اعداد',
      title_pashto: 'د شمېرو پېژندنه',
      description: 'Learn about whole numbers, place values, and number systems',
      order: 1,
      duration_minutes: 30,
      video_url: 'https://example.com/lesson1.mp4',
      is_published: true
    },
    {
      id: uuidv4(),
      course_id: courses[0].id,
      title: 'Addition and Subtraction',
      title_dari: 'جمع و تفریق',
      title_pashto: 'جمع او تفریق',
      description: 'Master addition and subtraction of multi-digit numbers',
      order: 2,
      duration_minutes: 45,
      video_url: 'https://example.com/lesson2.mp4',
      is_published: true
    },
    {
      id: uuidv4(),
      course_id: courses[0].id,
      title: 'Multiplication Basics',
      title_dari: 'مبانی ضرب',
      title_pashto: 'د ضرب بنسټونه',
      description: 'Understanding multiplication concepts and times tables',
      order: 3,
      duration_minutes: 40,
      video_url: 'https://example.com/lesson3.mp4',
      is_published: true
    }
  ];

  await knex('lessons').insert(mathLessons);

  console.log('Sample data inserted successfully!');
};