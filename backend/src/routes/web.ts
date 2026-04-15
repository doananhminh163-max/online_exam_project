import express, { Express, Response } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { getExams, createExam, updateExam, deleteExam } from '../controllers/admin/exam.controller.js';
import { getStudents, deleteStudent, updateStudent, createStudent } from '../controllers/admin/user.controller.js';
import { importQuestions, importStudents } from '../controllers/admin/import.controller.js';
import { getAvailableExams, getExamForStudent, submitExam, getAttemptResult } from '../controllers/client/exam.controller.js';
import { login, logout } from '../controllers/auth.controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const activateWebRoutes = (app: Express) => {
    const router = express.Router();

    // Auth Routes
    router.post('/api/login', login);
    router.post('/api/logout', logout);

    router.get('/api/me', verifyToken, (req: any, res: Response) => {
        res.json(req.user);
    });

    // Admin Exam Routes
    router.get('/api/exams', verifyToken, isAdmin, getExams);
    router.post('/api/exams', verifyToken, isAdmin, createExam);
    router.put('/api/exams/:id', verifyToken, isAdmin, updateExam);
    router.delete('/api/exams/:id', verifyToken, isAdmin, deleteExam);

    // Admin Import Routes
    router.post('/api/admin/import-students', verifyToken, isAdmin, upload.single('file'), importStudents);
    router.post('/api/admin/exams/import-questions', verifyToken, isAdmin, upload.single('file'), importQuestions);

    // Admin Student Management Routes
    router.get('/api/admin/students', verifyToken, isAdmin, getStudents);
    router.post('/api/admin/students', verifyToken, isAdmin, createStudent);
    router.put('/api/admin/students/:id', verifyToken, isAdmin, updateStudent);
    router.delete('/api/admin/students/:id', verifyToken, isAdmin, deleteStudent);

    // Student Exam Routes
    router.get('/api/student/exams', verifyToken, getAvailableExams);
    router.get('/api/student/exams/:id', verifyToken, getExamForStudent);
    router.post('/api/student/exams/:id/submit', verifyToken, submitExam);
    router.get('/api/student/results/:attemptId', verifyToken, getAttemptResult);

    app.use("/", router);
}

export default activateWebRoutes;
