import { Request, Response } from 'express';
import xlsx from 'xlsx';
import { prisma } from '../../config/prisma.config.js';
import bcrypt from 'bcrypt';

// Helper to remove diacritics and special characters for username generation
const removeVietnameseTones = (str: string) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/[^a-zA-Z0-9 ]/g, "");
    return str;
};

const generateUsername = (fullName: string, studentId: string) => {
    const unsign = removeVietnameseTones(fullName).toLowerCase();
    const parts = unsign.split(' ');
    const lastName = parts.pop() || '';
    const initials = parts.map(p => p.charAt(0)).join('');
    return `${lastName}${initials}${studentId || ''}`.replace(/\s+/g, '');
};

const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); // Random 8 chars
};

export const importStudents = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

        const errors: any[] = [];
        const studentsToInsert: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const fullName = row['Full Name'] || row['Họ và tên'] || row['full_name'];
            let email = row['Email'] || row['email'];
            const studentId = row['Student ID'] || row['Mã SV'] || row['student_id'] || '';

            // Standardize columns
            const username = row['Username'] || row['username'] || generateUsername(fullName || '', studentId);
            const password = row['Password'] || row['Mật khẩu'] || row['password'] || generateRandomPassword();

            if (!fullName || !email) {
                errors.push({ row: i + 2, reason: 'Thiếu Full Name hoặc Email' });
                continue;
            }

            studentsToInsert.push({
                username: username.toString(),
                password: password.toString(),
                email: email.toString(),
                full_name: fullName.toString(),
                role: 'student'
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
                // Check if user exists by email or username
                const existingUser = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: student.email },
                            { username: student.username }
                        ]
                    }
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: student
                    });
                    successCount++;
                } else {
                     console.warn(`Skipping student import: Username ${student.username} or Email ${student.email} already exists.`);
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

        const exam = await prisma.exam.findUnique({ where: { id: examId }});
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
