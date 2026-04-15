import { prisma } from '../../config/db.js';

export const clientExamService = {
  getAvailableExamsForStudent: async () => {
    return await prisma.exam.findMany({
      where: {
        end_time: {
          gt: new Date()
        }
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  },

  getExamDetails: async (id: number) => {
    return await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            content: true,
            option_a: true,
            option_b: true,
            option_c: true,
            option_d: true
          }
        }
      }
    });
  },

  submitExamAttempt: async (userId: number, examId: number, answers: Record<string, string>) => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) return null;

    let score = 0;
    const totalQuestions = exam.questions.length;
    const details = [];

    for (const question of exam.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.answer;
      if (isCorrect) score += (10 / totalQuestions);

      details.push({
        question_id: question.id,
        user_answer: userAnswer || null,
        is_correct: isCorrect
      });
    }

    const attempt = await prisma.examAttempt.create({
      data: {
        user_id: userId,
        exam_id: examId,
        start_time: new Date(), // Simple for now
        end_time: new Date(),
        score: Math.round(score * 100) / 100,
        attempt_details: {
          create: details
        }
      }
    });

    return attempt;
  },

  getAttemptResultDetails: async (attemptId: number, userId: number) => {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        attempt_details: {
          include: {
            question: true
          }
        }
      }
    });

    if (!attempt || attempt.user_id !== userId) {
      return null;
    }

    return attempt;
  }
};
