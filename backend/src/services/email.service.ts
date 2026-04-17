import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const isConfigured = () => !!(GMAIL_USER && GMAIL_APP_PASSWORD);

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD,
        },
    });
};

interface StudentEmailData {
    email: string;
    full_name: string;
    password: string;
    code: string;
}

const sendPasswordEmail = async (student: StudentEmailData): Promise<boolean> => {
    if (!isConfigured()) {
        console.warn(`[Email] Gmail chưa cấu hình. Bỏ qua gửi email cho ${student.email}`);
        return false;
    }

    const transporter = createTransporter();

    const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🎓 Hệ Thống Thi Trực Tuyến</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Thông tin tài khoản đăng nhập</p>
        </div>
        <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Xin chào <strong>${student.full_name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Tài khoản thi trực tuyến của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập:
            </p>
            <div style="background: #ffffff; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Mã sinh viên:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${student.code}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${student.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Mật khẩu:</td>
                        <td style="padding: 8px 0;">
                            <code style="background: #f1f5f9; padding: 4px 12px; border-radius: 6px; font-size: 16px; font-weight: 700; color: #dc2626; letter-spacing: 1px;">${student.password}</code>
                        </td>
                    </tr>
                </table>
            </div>
            <div style="background: #fffbeb; border-radius: 8px; padding: 14px 16px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                    ⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu để bảo mật tài khoản.
                </p>
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
                Email này được gửi tự động. Vui lòng không trả lời.
            </p>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: `"Hệ Thống Thi Trực Tuyến" <${GMAIL_USER}>`,
            to: student.email,
            subject: '🔑 Thông tin tài khoản thi trực tuyến',
            html: htmlContent,
        });
        console.log(`[Email] ✅ Đã gửi email cho ${student.email}`);
        return true;
    } catch (error) {
        console.error(`[Email] ❌ Lỗi gửi email cho ${student.email}:`, error);
        return false;
    }
};

export const sendBulkPasswordEmails = async (students: StudentEmailData[]) => {
    if (!isConfigured()) {
        console.warn('[Email] Gmail chưa cấu hình (GMAIL_USER, GMAIL_APP_PASSWORD). Bỏ qua gửi email.');
        return { sent: 0, failed: students.length };
    }

    console.log(`[Email] Bắt đầu gửi email cho ${students.length} thí sinh...`);

    let sent = 0;
    let failed = 0;

    for (const student of students) {
        const success = await sendPasswordEmail(student);
        if (success) sent++;
        else failed++;
    }

    console.log(`[Email] Hoàn tất: ${sent} thành công, ${failed} thất bại.`);
    return { sent, failed };
};
