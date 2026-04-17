import { Request, Response } from 'express';
import { prisma } from '../../config/db.js';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

export const uploadProfileImage = async (req: any, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const imageUrl = `/uploads/profile/${req.file.filename}`;

        // Get old image to delete
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user?.image) {
            const oldImagePath = path.join(process.cwd(), 'public', user.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl }
        });

        res.json({ message: 'Upload success', imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
