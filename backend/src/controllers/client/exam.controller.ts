import { Request, Response } from 'express';
import { clientExamService } from '../../services/client/exam.service.js';

export const getAvailableExams = async (req: any, res: Response) => {
    try {
        const exams = await clientExamService.getAvailableExamsForStudent(req.user.id);
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const startExam = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const result = await clientExamService.startExamAttempt(req.user.id, parseInt(id as string));
        
        if (!result) return res.status(404).json({ message: 'Exam not found' });
        
        res.json(result);
    } catch (error) {
        console.error(error);
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
        const { id } = req.params; // examId from URL (optional now but kept for consistency)
        const { attemptId, answers } = req.body; 
        const userId = req.user.id;

        const attempt = await clientExamService.submitExamAttempt(userId, parseInt(attemptId as string), answers);

        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

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
