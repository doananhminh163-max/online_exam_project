import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { exam_id, search } = req.query;
        const where: any = {};

        if (exam_id) {
            where.exam_id = parseInt(exam_id as string);
        }

        if (search) {
            where.content = { contains: search as string };
        }

        const questions = await prisma.question.findMany({
            where,
            include: {
                exam: {
                    select: { name: true }
                }
            },
            orderBy: { id: 'desc' }
        });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách câu hỏi', error });
    }
};

export const createQuestion = async (req: Request, res: Response) => {
    try {
        const { exam_id, content, option_a, option_b, option_c, option_d, answer, explain } = req.body;
        const question = await prisma.question.create({
            data: {
                exam_id: parseInt(exam_id),
                content,
                option_a,
                option_b,
                option_c,
                option_d,
                answer,
                explain
            }
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo câu hỏi', error });
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { exam_id, content, option_a, option_b, option_c, option_d, answer, explain } = req.body;
        const question = await prisma.question.update({
            where: { id: parseInt(id as string) },
            data: {
                exam_id: parseInt(exam_id),
                content,
                option_a,
                option_b,
                option_c,
                option_d,
                answer,
                explain
            }
        });
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật câu hỏi', error });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.question.delete({ where: { id: parseInt(id as string) } });
        res.json({ message: 'Đã xóa câu hỏi thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa câu hỏi', error });
    }
};
