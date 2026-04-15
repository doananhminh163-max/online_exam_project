import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';
import bcrypt from 'bcrypt';

export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: {
                id: true,
                code: true,
                full_name: true,
                email: true,
                role: true
            },
            orderBy: { id: 'desc' }
        });
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: parseInt(id as string) }
        });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { full_name, email, code } = req.body;
        const updatedStudent = await prisma.user.update({
            where: { id: parseInt(id as string) },
            data: { full_name, email, code }
        });
        res.json(updatedStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const { full_name, email, code } = req.body;
        
        // Generate a random 8-character password
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        const newStudent = await prisma.user.create({
            data: {
                full_name,
                email,
                code,
                password: hashedPassword,
                role: 'STUDENT'
            }
        });

        // Optionally return the random password so the admin can give it to the student
        res.status(201).json({ ...newStudent, generatedPassword: randomPassword });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Mã sinh viên hoặc Email đã tồn tại' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};
