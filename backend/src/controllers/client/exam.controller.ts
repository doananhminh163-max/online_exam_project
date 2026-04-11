import { Request, Response } from 'express';
import { clientExamService } from '../../services/client/exam.service.js';

export const getAvailableExams = async (req: Request, res: Response) => {
    try {
        const exams = await clientExamService.getAvailableExamsForStudent();
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getExamForStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const exam = await clientExamService.getExamDetails(parseInt(id as string));

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitExam = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { answers } = req.body; // { questionId: answer }
        const userId = req.user.id;

        const attempt = await clientExamService.submitExamAttempt(userId, parseInt(id as string), answers);

        if (!attempt) return res.status(404).json({ message: 'Exam not found' });

        res.json({ attemptId: attempt.id, score: attempt.score });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAttemptResult = async (req: any, res: Response) => {
    try {
        const { attemptId } = req.params;
        const attempt = await clientExamService.getAttemptResultDetails(parseInt(attemptId as string), req.user.id);

        if (!attempt) {
            return res.status(404).json({ message: 'Result not found' });
        }

        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
