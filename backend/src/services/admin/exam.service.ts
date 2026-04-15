import { prisma } from '../../config/db.js';

export const examService = {
  getAllExams: async () => {
    return await prisma.exam.findMany({
      orderBy: { id: 'desc' }
    });
  },

  createExamRecord: async (data: { name: string; start_time: string; end_time: string; duration_mins: string | number; attempts_num?: string | number }) => {
    return await prisma.exam.create({
      data: {
        name: data.name,
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        duration_mins: Number(data.duration_mins),
        attempts_num: Number(data.attempts_num) || 1, // Default 1 attempt
      }
    });
  },

  updateExamRecord: async (id: number, data: { name?: string; start_time?: string; end_time?: string; duration_mins?: string | number; attempts_num?: string | number }) => {
    return await prisma.exam.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.start_time && { start_time: new Date(data.start_time) }),
        ...(data.end_time && { end_time: new Date(data.end_time) }),
        ...(data.duration_mins && { duration_mins: Number(data.duration_mins) }),
        ...(data.attempts_num !== undefined && { attempts_num: Number(data.attempts_num) })
      }
    });
  },

  deleteExamRecord: async (id: number) => {
    // 1. Tìm tất cả các Lượt làm bài (ExamAttempt) của Môn thi này
    const attempts = await prisma.examAttempt.findMany({
      where: { exam_id: id },
      select: { id: true }
    });
    const attemptIds = attempts.map(a => a.id);

    // 2. Sử dụng Transaction để xoá các bản ghi phụ thuộc theo thứ tự từ dưới lên
    return await prisma.$transaction([
      // Xoá Chi tiết làm bài (nếu có lượt làm bài nào)
      prisma.attemptDetail.deleteMany({
        where: { attempt_id: { in: attemptIds } }
      }),
      
      // Xoá Lượt làm bài
      prisma.examAttempt.deleteMany({
        where: { exam_id: id }
      }),
      
      // Xoá Ngân hàng Câu hỏi thuộc Môn thi
      prisma.question.deleteMany({
        where: { exam_id: id }
      }),
      
      // Cuối cùng: Xoá Môn thi chính
      prisma.exam.delete({
        where: { id }
      })
    ]);
  }
};
