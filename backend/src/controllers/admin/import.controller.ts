import { Request, Response } from 'express';
import xlsx from 'xlsx';
import { prisma } from '../../config/db.js';
import bcrypt from 'bcrypt';
import { sendBulkPasswordEmails } from '../../services/email.service.js';

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

        // Lưu mật khẩu plaintext trước khi hash để gửi email
        const plaintextPasswords = new Map<string, string>();
        for (const student of studentsToInsert) {
            plaintextPasswords.set(student.email, student.password);
        }

        // Hash passwords
        const hashedStudents = await Promise.all(studentsToInsert.map(async (student) => ({
            ...student,
            password: await bcrypt.hash(student.password, 10)
        })));

        // Insert to DB — theo dõi thí sinh mới để gửi email
        let successCount = 0;
        const newStudentsForEmail: { email: string; full_name: string; password: string; code: string }[] = [];

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

                    // Lưu thông tin thí sinh mới để gửi email (dùng mật khẩu plaintext)
                    newStudentsForEmail.push({
                        email: student.email,
                        full_name: student.full_name,
                        password: plaintextPasswords.get(student.email)!,
                        code: student.code,
                    });
                } else {
                    console.warn(`Skipping student import: Email ${student.email} or Code ${student.code} already exists.`);
                }
            }
        } catch (dbError) {
            return res.status(500).json({ message: 'Lỗi khi import vào database', error: dbError });
        }

        // Gửi email mật khẩu cho thí sinh mới (chạy bất đồng bộ, không block response)
        if (newStudentsForEmail.length > 0) {
            sendBulkPasswordEmails(newStudentsForEmail).catch((err) => {
                console.error('[Email] Lỗi khi gửi email hàng loạt:', err);
            });
        }

        return res.status(201).json({
            message: 'Import thành công',
            count: successCount,
            total: studentsToInsert.length,
            emailsSending: newStudentsForEmail.length > 0,
        });

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

        // Cache map để lưu lookup đỡ tốn call DB nhiều lần (tận dụng name là unique attribute)
        const examNameCache = new Map<string, number>();

        let workbook;
        if (req.file.originalname.toLowerCase().endsWith('.csv')) {
            const csvString = req.file.buffer.toString('utf8');
            workbook = xlsx.read(csvString, { type: 'string' });
        } else {
            workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        }
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json<any[]>(workbook.Sheets[sheetName], { header: 1 });
        
        // Skip header row
        const rows = data.slice(1);

        const errors: any[] = [];
        const questionsToInsert: any[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row.length === 0) continue; // Skip empty rows

            // Expected columns: Exam Name (0), Content (1), A (2), B (3), C (4), D (5), Answer (6), Explain (7)
            const examName = row[0];
            const content = row[1];
            const optionA = row[2];
            const optionB = row[3];
            const optionC = row[4];
            const optionD = row[5];
            const answer = row[6];
            const explain = row[7] || '';

            // Nếu trong file chỉ định tên môn thi, tìm ID của môn thi đó.
            // Nếu không, fallback về examId đã chọn trong dropdown.
            let currentExamId = examId;
            if (examName) {
                const examNameStr = examName.toString().trim();
                if (examNameCache.has(examNameStr)) {
                    currentExamId = examNameCache.get(examNameStr)!;
                } else {
                    // Do 'name' là @unique nên ta có thể dùng findUnique cho tốc độ tối đa
                    const foundExam = await prisma.exam.findUnique({
                        where: { name: examNameStr }
                    });
                    if (foundExam) {
                        examNameCache.set(examNameStr, foundExam.id);
                        currentExamId = foundExam.id;
                    } else {
                        errors.push({ row: i + 2, reason: `Không tìm thấy môn thi có tên: "${examName}"` });
                        continue;
                    }
                }
            }

            const isMissing = (val: any) => val === undefined || val === null || val === '';

            if (isMissing(content) || isMissing(optionA) || isMissing(optionB) || isMissing(optionC) || isMissing(optionD) || isMissing(answer)) {
                errors.push({ row: i + 2, reason: 'Thiếu dữ liệu nội dung, 4 đáp án hoặc đáp án đúng' });
                continue;
            }

            questionsToInsert.push({
                exam_id: currentExamId,
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
