import { Request, Response } from 'express';
import xlsx from 'xlsx';
import { prisma } from '../../config/db.js';
import bcrypt from 'bcrypt';

const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); // Random 8 chars
};

export const importStudents = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file' });
        }

        let workbook;
        if (req.file.originalname.toLowerCase().endsWith('.csv')) {
            const csvString = req.file.buffer.toString('utf8');
            workbook = xlsx.read(csvString, { type: 'string' });
        } else {
            workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        }

        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

        const errors: any[] = [];
        const studentsToInsert: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const fullName = row['Full Name'];
            let email = row['Email'];
            const studentCode = row['Student Code'] || '';

            // Standardize columns
            const password = generateRandomPassword();

            if (!fullName || !email || !studentCode) {
                errors.push({ row: i + 2, reason: 'Thiếu Full Name, Email hoặc Mã SV (Code)' });
                continue;
            }

            studentsToInsert.push({
                code: studentCode.toString(),
                password: password.toString(),
                email: email.toString(),
                full_name: fullName.toString(),
                role: 'STUDENT'
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Tệp chứa dữ liệu không hợp lệ', errors });
        }

        // Hash passwords
        const hashedStudents = await Promise.all(studentsToInsert.map(async (student) => ({
            ...student,
            password: await bcrypt.hash(student.password, 10)
        })));

        // Insert to DB
        let successCount = 0;
        try {
            for (const student of hashedStudents) {
                // Check if user exists by email
                const existingUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: student.email },
                            { code: student.code }
                        ]
                    }
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: student
                    });
                    successCount++;
                } else {
                    console.warn(`Skipping student import: Email ${student.email} or Code ${student.code} already exists.`);
                }
            }
        } catch (dbError) {
            return res.status(500).json({ message: 'Lỗi khi import vào database', error: dbError });
        }

        // Background Job for emails omitted

        return res.status(201).json({ message: 'Import thành công', count: successCount, total: studentsToInsert.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server file parser', error });
    }
};

export const importQuestions = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file' });
        }

        const examId = parseInt(req.body.exam_id);
        if (isNaN(examId) || examId <= 0) {
            return res.status(400).json({ message: 'Vui lòng chọn Môn thi hợp lệ' });
        }

        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            return res.status(404).json({ message: 'Không tìm thấy Môn thi' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

        const errors: any[] = [];
        const questionsToInsert: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const content = row['Nội dung'] || row['content'] || row['Question'];
            const optionA = row['A'] || row['Option A'] || row['option_a'];
            const optionB = row['B'] || row['Option B'] || row['option_b'];
            const optionC = row['C'] || row['Option C'] || row['option_c'];
            const optionD = row['D'] || row['Option D'] || row['option_d'];
            const answer = row['Đáp án'] || row['Answer'] || row['answer'];
            const explain = row['Giải thích'] || row['Explain'] || row['explain'] || '';

            if (!content || !optionA || !optionB || !optionC || !optionD || !answer) {
                errors.push({ row: i + 2, reason: 'Thiếu dữ liệu nội dung, 4 đáp án hoặc đáp án đúng' });
                continue;
            }

            questionsToInsert.push({
                exam_id: examId,
                content: content.toString(),
                option_a: optionA.toString(),
                option_b: optionB.toString(),
                option_c: optionC.toString(),
                option_d: optionD.toString(),
                answer: answer.toString(),
                explain: explain ? explain.toString() : null
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Tệp chứa dữ liệu câu hỏi không hợp lệ', errors });
        }

        await prisma.question.createMany({
            data: questionsToInsert
        });

        return res.status(201).json({ message: 'Import thành công', count: questionsToInsert.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server file parser', error });
    }
};
