import express, { Express, Response } from 'express';
import { prisma } from '../config/db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { getExams, createExam, updateExam, deleteExam, getStats } from '../controllers/admin/exam.controller.js';
import { getStudents, deleteStudent, updateStudent, createStudent } from '../controllers/admin/user.controller.js';
import { importQuestions, importStudents } from '../controllers/admin/import.controller.js';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/admin/question.controller.js';
import { getAvailableExams, startExam, getExamForStudent, submitExam, getAttemptResult } from '../controllers/client/exam.controller.js';
import { login, logout } from '../controllers/auth.controller.js';
import { uploadProfileImage, changePassword } from '../controllers/client/profile.controller.js';
import { getExamReports, getRanking } from '../controllers/admin/report.controller.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads/profile';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req: any, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const profileUpload = multer({ 
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)!'));
    }
});

const activateWebRoutes = (app: Express) => {
    const router = express.Router();

    // Auth Routes
    router.post('/api/login', login);
    router.post('/api/logout', logout);

    router.get('/api/me', verifyToken, async (req: any, res: Response) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    code: true,
                    full_name: true,
                    email: true,
                    role: true,
                    image: true
                }
            });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // Admin Exam Routes
    router.get('/api/exams', verifyToken, isAdmin, getExams);
    router.get('/api/admin/dashboard-stats', verifyToken, isAdmin, getStats);
    router.post('/api/exams', verifyToken, isAdmin, createExam);
    router.put('/api/exams/:id', verifyToken, isAdmin, updateExam);
    router.delete('/api/exams/:id', verifyToken, isAdmin, deleteExam);

    // Admin Import Routes
    router.post('/api/admin/import-students', verifyToken, isAdmin, memoryUpload.single('file'), importStudents);
    router.post('/api/admin/exams/import-questions', verifyToken, isAdmin, memoryUpload.single('file'), importQuestions);
    router.get('/api/admin/questions', verifyToken, isAdmin, getQuestions);
    router.post('/api/admin/questions', verifyToken, isAdmin, createQuestion);
    router.put('/api/admin/questions/:id', verifyToken, isAdmin, updateQuestion);
    router.delete('/api/admin/questions/:id', verifyToken, isAdmin, deleteQuestion);

    // Admin Student Management Routes
    router.get('/api/admin/students', verifyToken, isAdmin, getStudents);
    router.post('/api/admin/students', verifyToken, isAdmin, createStudent);
    router.put('/api/admin/students/:id', verifyToken, isAdmin, updateStudent);
    router.delete('/api/admin/students/:id', verifyToken, isAdmin, deleteStudent);

    // Student Exam Routes
    router.get('/api/student/exams', verifyToken, getAvailableExams);
    router.post('/api/student/exams/:id/start', verifyToken, startExam);
    router.get('/api/student/exams/:id', verifyToken, getExamForStudent);
    router.post('/api/student/exams/:id/submit', verifyToken, submitExam);
    router.get('/api/student/results/:attemptId', verifyToken, getAttemptResult);

    // Profile Routes
    router.post('/api/student/profile/upload-image', verifyToken, profileUpload.single('image'), uploadProfileImage);
    router.post('/api/student/profile/change-password', verifyToken, changePassword);

    // Report Routes
    router.get('/api/admin/reports/exams', verifyToken, isAdmin, getExamReports);
    router.get('/api/admin/reports/exams/:id/ranking', verifyToken, isAdmin, getRanking);

    app.use("/", router);
}

export default activateWebRoutes;
