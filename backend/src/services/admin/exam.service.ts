import { prisma } from '../../config/db.js';

export const examService = {
  getAllExams: async () => {
    const exams = await prisma.exam.findMany({
      include: {
        _count: {
          select: { exam_attempts: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    return exams.map((exam: any) => ({
      ...exam,
      participants: exam._count.exam_attempts
    }));
  },

  createExamRecord: async (data: { name: string; start_time: string; end_time: string; duration_mins: string | number; attempts_num?: string | number; questions_num?: string | number }) => {
    return await prisma.exam.create({
      data: {
        name: data.name,
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        duration_mins: Number(data.duration_mins),
        attempts_num: Number(data.attempts_num) || 1, // Default 1 attempt
        questions_num: Number(data.questions_num) || 0,
      }
    });
  },

  updateExamRecord: async (id: number, data: { name?: string; start_time?: string; end_time?: string; duration_mins?: string | number; attempts_num?: string | number; questions_num?: string | number }) => {
    return await prisma.exam.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.start_time && { start_time: new Date(data.start_time) }),
        ...(data.end_time && { end_time: new Date(data.end_time) }),
        ...(data.duration_mins && { duration_mins: Number(data.duration_mins) }),
        ...(data.attempts_num !== undefined && { attempts_num: Number(data.attempts_num) }),
        ...(data.questions_num !== undefined && { questions_num: Number(data.questions_num) })
      }
    });
  },

  deleteExamRecord: async (id: number) => {
    // ... (existing code remain unchanged)
    const attempts = await prisma.examAttempt.findMany({
      where: { exam_id: id },
      select: { id: true }
    });
    const attemptIds = attempts.map(a => a.id);

    return await prisma.$transaction([
      prisma.attemptDetail.deleteMany({
        where: { attempt_id: { in: attemptIds } }
      }),
      prisma.examAttempt.deleteMany({
        where: { exam_id: id }
      }),
      prisma.question.deleteMany({
        where: { exam_id: id }
      }),
      prisma.exam.delete({
        where: { id }
      })
    ]);
  },

  getDashboardStats: async () => {
    const [examCount, studentCount, questionCount, passedCount, totalAttempts] = await Promise.all([
      prisma.exam.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.question.count(),
      prisma.examAttempt.count({
        where: { score: { gte: 5 } }
      }),
      prisma.examAttempt.count()
    ]);

    const completionRate = totalAttempts > 0 
      ? Math.round((passedCount / totalAttempts) * 100) 
      : 0;

    return {
      exams: examCount,
      students: studentCount,
      questions: questionCount,
      completionRate: completionRate
    };
  }
};
