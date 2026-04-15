import bcrypt from 'bcrypt';
import { prisma } from './db.js';

async function initDatabase() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@exampro.com' },
    update: {
      password: hashedPassword,
      full_name: 'GV. Nguyễn Văn A',
      role: 'ADMIN',
      code: 'GV001',
    },
    create: {
      email: 'teacher@exampro.com',
      password: hashedPassword,
      full_name: 'GV. Nguyễn Văn A',
      role: 'ADMIN',
      code: 'GV001',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@exampro.com' },
    update: {
      password: hashedPassword,
      full_name: 'SV. Nguyễn Thị B',
      role: 'STUDENT',
      code: 'SV001',
    },
    create: {
      email: 'student@exampro.com',
      password: hashedPassword,
      full_name: 'SV. Nguyễn Thị B',
      role: 'STUDENT',
      code: 'SV001',
    },
  });

  console.log('Accounts configured:', [
    { email: teacher.email, role: teacher.role, password: "123456" },
    { email: student.email, role: student.role, password: "123456" }
  ]);

  // Seed Exams
  const exams = [
    { name: "Giải Tích", duration_mins: 60, attempts_num: 1, start_time: new Date("2026-10-15T08:00:00Z"), end_time: new Date("2026-10-15T10:00:00Z") },
    { name: "Lập Trình Java", duration_mins: 60, attempts_num: 2, start_time: new Date("2026-09-28T09:00:00Z"), end_time: new Date("2026-09-28T17:00:00Z") },
    { name: "Cơ Sở Dữ Liệu", duration_mins: 60, attempts_num: 1, start_time: new Date("2026-12-10T14:00:00Z"), end_time: new Date("2026-12-10T16:00:00Z") },
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
