## 1.Giới thiệu dự án
- Tên dự án: Online Exam Project
- Tech Stack: 
    + Language: TypeScript, HTML, Vanilla CSS
    + Frontend: React 19 + Vite 8
    + Backend: Express 5
    + Database: SQLite + Prisma 7
    + Email: Nodemailer (Gmail SMTP)

## 2.Phân tích dự án
### Thí sinh: 
- Thí sinh đăng nhập vào hệ thống bằng tài khoản được gửi qua email.
- Thí sinh chọn môn thi.
- Hệ thống kiểm tra lịch sử thi của thí sinh đối với môn này:
    + Nếu đã thi đủ k lần: Thông báo hết lượt và chặn quyền làm bài.
    + Nếu chưa thi đủ k lần: Cho phép tiếp tục.
- Hệ thống tự động sinh đề: Bốc ngẫu nhiên số lượng câu hỏi (theo cấu hình của Ban quản lý) từ ngân hàng câu hỏi.
- Thí sinh tiến hành làm bài (chọn đáp án).
- Thí sinh nhấn "Nộp bài" (hoặc hệ thống tự động thu bài khi hết giờ).
- Hệ thống chấm điểm: So sánh đáp án của thí sinh với đáp án chuẩn và tính điểm. Lưu lại điểm, thời gian làm bài, danh sách câu đúng/sai.
- Hệ thống hiển thị kết quả: Ngay lập tức hiện ra màn hình Điểm số tổng, danh sách các câu hỏi và hiển thị đáp án đúng với những câu làm sai, kèm lời giải thích (nếu có).
- Hệ thống so sánh điểm hiện tại với điểm cao nhất của thí sinh (mặc định là 0), nếu cao hơn thì cập nhật điểm cao nhất.
- Thí sinh có thể chọn tính năng "In phiếu điểm" để xuất ra bản cứng hoặc PDF.
- Thí sinh có thể cập nhật ảnh đại diện và đổi mật khẩu từ trang Hồ sơ cá nhân.

### Giảng viên:
- Giảng viên đăng nhập bằng tài khoản được cấp sẵn.
- Giảng viên tạo môn thi.
- Giảng viên cấu hình môn thi (thời điểm bắt đầu, thời điểm kết thúc, thời lượng bài làm, số câu hỏi, số lần thi tối đa).
- Giảng viên tải lên file Excel/CSV chứa bộ câu hỏi trắc nghiệm. 
- Hệ thống kiểm tra định dạng bảng, trích xuất dữ liệu và lưu vào cơ sở dữ liệu ngân hàng câu hỏi. Hệ thống ánh xạ câu hỏi vào đúng Exam dựa trên cột "Exam Name".
- Giảng viên có thể thực hiện CRUD với toàn bộ câu hỏi.
- Giảng viên tải lên file Excel/CSV chứa dữ liệu của toàn bộ thí sinh.
- Hệ thống tự tạo tài khoản cho thí sinh (username: mã sinh viên; password: random), lưu vào cơ sở dữ liệu người dùng và gửi tài khoản tự động qua email cho thí sinh (Nodemailer + Gmail SMTP).
- Giảng viên có thể thực hiện CRUD đối với dữ liệu thí sinh.
- Giảng viên có thể xem thống kê và bảng xếp hạng sinh viên theo từng môn thi.
- Giảng viên có thể cập nhật ảnh đại diện và đổi mật khẩu từ trang Hồ sơ cá nhân.

## 3.Kiến trúc tối thiểu
### Frontend: 
- Các page chính: Login, Student Dashboard, Student Exam (Taking), Student Result, Student Profile, Teacher Dashboard, Exam Management, Student Management, Question Bank, Reports/Ranking, Teacher Profile
- State Management: 
    + React Hooks (useState, useEffect)
    + React Context API (AuthContext)
- Routing: React Router v7
- HTTP Client: Axios
- Icons: Lucide React
### Backend:
- Các module chính: auth, user, exam, question bank, testing, grading, import, email, profile, report
- API: RESTful + JWT (HTTP-Only Cookie)
- File Upload: Multer
- Email: Nodemailer (Gmail SMTP)
### Database: users, exams, questions, exam_attempts, attempt_details

## 4.Phân tích database
### users
- id: Integer, PK, Auto Increment
- code: String, Unique, Not Null
- password: String, Not Null
- email: String, Unique, Not Null
- full_name: String, Not Null
- role: String, Not Null
- image: String, Nullable
### exams
- id: Integer, PK, Auto Increment
- name: String, Unique, Not Null
- start_time:	 DateTime, Not Null
- end_time: DateTime, Not Null
- duration_mins: Integer, Not Null
- attempts_num: Integer, Default 2
- questions_num: Integer, Default 0
### questions
- id: Integer, PK, Auto Increment
- exam_id: Integer, FK -> Exams(id)
- content: Text, Not Null
- option_a: Text, Not Null	
- option_b: Text, Not Null
- option_c: Text, Not Null	
- option_d: Text, Not Null
- answer: String(1), Not Null
- explain: Text, Nullable
### exam_attempts:
- id: Integer, PK, Auto Increment
- user_id: Integer, FK -> Users(id)
- exam_id: Integer, FK -> Exams(id)
- start_time: DateTime, Not Null
- end_time: DateTime, Not Null
- score: Float, Default 0
### attempt_details:
- id: Integer, PK, Auto Increment
- attempt_id: Integer, FK -> Exam_Attempts(id)
- question_id: Integer, FK -> Questions(id)
- user_answer: String(1), Nullable
- is_correct: Boolean, Nullable
### Relation:
- exams		    1:N	questions
- users		    1:N	exam_attempts
- exams		    1:N	exam_attempts
- exam_attempts	1:N	attempt_details
- questions		1:N	attempt_details
- users		    N:N	exams (thông qua exam_attempts)
- exam_attempts	N:N	questions (thông qua attempt_details)
