import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';

export const getExamReports = async (req: Request, res: Response) => {
    try {
        const exams = await prisma.exam.findMany({
            orderBy: { start_time: 'desc' }
        });

        const totalStudents = await prisma.user.count({
            where: { role: 'STUDENT' }
        });

        const reports = await Promise.all(exams.map(async (exam) => {
            // Get all unique users who attempted this exam
            const attempts = await prisma.examAttempt.findMany({
                where: { exam_id: exam.id },
                select: {
                    user_id: true,
                    score: true
                }
            });

            // Group by user_id to find best score per student
            const studentBestScores: Record<number, number> = {};
            attempts.forEach(attempt => {
                if (!studentBestScores[attempt.user_id] || attempt.score > studentBestScores[attempt.user_id]) {
                    studentBestScores[attempt.user_id] = attempt.score;
                }
            });

            const attemptedCount = Object.keys(studentBestScores).length;
            const passCount = Object.values(studentBestScores).filter(score => score >= 5.0).length;
            const failCount = attemptedCount - passCount;
            const notAttemptedCount = Math.max(0, totalStudents - attemptedCount);

            return {
                id: exam.id,
                name: exam.name,
                startTime: exam.start_time,
                endTime: exam.end_time,
                totalStudents,
                attempted: attemptedCount,
                passed: passCount,
                failed: failCount,
                notAttempted: notAttemptedCount
            };
        }));

        res.json(reports);
    } catch (error) {
        console.error('getExamReports error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getRanking = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const examId = parseInt(id as string);

        const allAttempts = await prisma.examAttempt.findMany({
            where: { exam_id: examId },
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        code: true,
                        image: true
                    }
                }
            }
        });

        // Group by user_id to get the best attempt for each student
        const bestAttemptsMap: Record<number, any> = {};

        allAttempts.forEach(attempt => {
            const duration = attempt.end_time.getTime() - attempt.start_time.getTime();
            const currentBest = bestAttemptsMap[attempt.user_id];

            if (!currentBest || attempt.score > currentBest.score) {
                bestAttemptsMap[attempt.user_id] = { ...attempt, duration };
            } else if (attempt.score === currentBest.score) {
                // Tie-breaker: duration (shorter is better)
                if (duration < currentBest.duration) {
                    bestAttemptsMap[attempt.user_id] = { ...attempt, duration };
                }
            }
        });

        const ranking = Object.values(bestAttemptsMap).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.duration - b.duration;
        });

        res.json(ranking);
    } catch (error) {
        console.error('getRanking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
