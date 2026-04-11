import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function initDatabase() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@exampro.com' },
    update: {
      password: hashedPassword,
      full_name: 'GV. Nguyễn Văn A',
      role: 'ADMIN',
    },
    create: {
      username: 'teacher1',
      email: 'teacher@exampro.com',
      password: hashedPassword,
      full_name: 'GV. Nguyễn Văn A',
      role: 'ADMIN',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@exampro.com' },
    update: {
      password: hashedPassword,
      full_name: 'SV. Nguyễn Thị B',
      role: 'STUDENT',
    },
    create: {
      username: 'student1',
      email: 'student@exampro.com',
      password: hashedPassword,
      full_name: 'SV. Nguyễn Thị B',
      role: 'STUDENT',
    },
  });

  console.log('Accounts configured:', [
    { email: teacher.email, role: teacher.role, password: "123456" },
    { email: student.email, role: student.role, password: "123456" }
  ]);

  const exam = await prisma.exam.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Lập trình Web nâng cao',
      duration_mins: 60,
      start_time: new Date(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      questions: {
        create: [
          { content: 'Đâu là đặc điểm nổi bật của React?', option_a: 'Virtual DOM', option_b: 'Two-way data binding', option_c: 'MVC Framework', option_d: 'Tất cả đều sai', answer: 'Virtual DOM' },
          { content: 'Hook nào dùng để quản lý side effects?', option_a: 'useState', option_b: 'useEffect', option_c: 'useContext', option_d: 'useReducer', answer: 'useEffect' },
          { content: 'JSX là gì?', option_a: 'Mở rộng cú pháp JS', option_b: 'Database', option_c: 'Thư viện CSS', option_d: 'Web server', answer: 'Mở rộng cú pháp JS' }
        ]
      }
    }
  });

  console.log('Sample exam created');

  // Seed Exams
  const exams = [
    { name: "Thi Giữa kỳ - OOP", duration_mins: 60, attempts_num: 1, start_time: new Date("2026-10-15T08:00:00Z"), end_time: new Date("2026-10-15T10:00:00Z") },
    { name: "Quiz 1 - Hệ điều hành", duration_mins: 15, attempts_num: 2, start_time: new Date("2026-09-28T09:00:00Z"), end_time: new Date("2026-09-28T17:00:00Z") },
    { name: "Thi Cuối kỳ - CSDL", duration_mins: 90, attempts_num: 1, start_time: new Date("2026-12-10T14:00:00Z"), end_time: new Date("2026-12-10T16:00:00Z") },
  ];

  for (const ex of exams) {
    const existing = await prisma.exam.findFirst({ where: { name: ex.name } });
    if (!existing) {
        await prisma.exam.create({ data: ex });
    }
  }

  console.log('Exams seeded successfully');
}

export default initDatabase;

// For manual execution via CLI
if (process.argv[1]?.includes('seed.ts')) {
  initDatabase()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
