import { Request, Response, NextFunction } from 'express';
import { examService } from '../../services/admin/exam.service.js';

export const getExams = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const exams = await examService.getAllExams();
        res.json(exams);
    } catch (error) {
        next(error);
    }
};

export const createExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, start_time, end_time, duration_mins, attempts_num } = req.body;
        
        // Basic validation
        if (!name || !start_time || !end_time || !duration_mins) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        const newExam = await examService.createExamRecord({ name, start_time, end_time, duration_mins, attempts_num });

        res.status(201).json(newExam);
    } catch (error) {
        next(error);
    }
};

export const updateExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, start_time, end_time, duration_mins, attempts_num } = req.body;

        const updatedExam = await examService.updateExamRecord(parseInt(id as string), { name, start_time, end_time, duration_mins, attempts_num });

        res.json(updatedExam);
    } catch (error) {
        next(error);
    }
};

export const deleteExam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await examService.deleteExamRecord(parseInt(id as string));

        res.json({ message: 'Xóa môn thi thành công' });
    } catch (error) {
        next(error);
    }
};
