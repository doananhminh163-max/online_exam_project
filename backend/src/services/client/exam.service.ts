import { prisma } from '../../config/db.js';

export const clientExamService = {
  getAvailableExamsForStudent: async (userId: number) => {
    return await prisma.exam.findMany({
      include: {
        _count: {
          select: { questions: true }
        },
        exam_attempts: {
          where: { user_id: userId },
          include: {
            attempt_details: true
          }
        }
      }
    });
  },

  getExamDetails: async (id: number) => {
    return await prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
  },

  startExamAttempt: async (userId: number, examId: number) => {
    // 1. Get exam info
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true }
    });

    if (!exam) return null;

    // 2. Randomly pick questions based on questions_num
    const allQuestions = exam.questions;
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    const limit = exam.questions_num > 0 ? Math.min(exam.questions_num, shuffled.length) : shuffled.length;
    const selectedQuestions = shuffled.slice(0, limit);

    // 3. Create Attempt and placeholder Details
    const attempt = await prisma.examAttempt.create({
      data: {
        user_id: userId,
        exam_id: examId,
        start_time: new Date(),
        end_time: new Date(), // Will be updated on submit
        score: 0,
        attempt_details: {
          create: selectedQuestions.map(q => ({
            question_id: q.id
          }))
        }
      },
      include: {
        attempt_details: {
          include: {
            question: {
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
        }
      }
    });

    return {
      attemptId: attempt.id,
      name: exam.name,
      duration_mins: exam.duration_mins,
      questions: attempt.attempt_details.map(d => d.question)
    };
  },

  submitExamAttempt: async (userId: number, attemptId: number, answers: Record<string, string>) => {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { 
        exam: true,
        attempt_details: {
          include: { question: true }
        }
      }
    });

    if (!attempt || attempt.user_id !== userId) return null;

    let correctCount = 0;
    const questions = attempt.attempt_details.map(d => d.question);
    const totalQuestions = questions.length;

    for (const detail of attempt.attempt_details) {
      const userAnswer = answers[detail.question_id];
      const isCorrect = userAnswer === detail.question.answer;
      if (isCorrect) correctCount++;

      // Update detail
      await prisma.attemptDetail.update({
        where: { id: detail.id },
        data: {
          user_answer: userAnswer || null,
          is_correct: isCorrect
        }
      });
    }

    const score = totalQuestions > 0 ? (correctCount * 10) / totalQuestions : 0;
    const currentAttemptScore = Math.round(score * 100) / 100;

    // 4. Find the highest score from PREVIOUS attempts of this exam by this user
    const previousBestAttempt = await prisma.examAttempt.findFirst({
      where: {
        user_id: userId,
        exam_id: attempt.exam_id,
        id: { not: attemptId }, // Don't count the current attempt yet
        end_time: { not: undefined } // Only count finished attempts
      },
      orderBy: { score: 'desc' },
      select: { score: true }
    });

    const previousMaxScore = previousBestAttempt?.score || 0;
    const finalScore = Math.max(currentAttemptScore, previousMaxScore);

    return await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        end_time: new Date(),
        score: finalScore
      }
    });
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
