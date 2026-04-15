## 1.Giới thiệu dự án
- Tên dự án: Online Exam Project
- Tech Stack: 
    + Language: TypeScript, HTML, CSS + Bootstrap
    + Frontend: React Vite
    + Backend: Express
    + Database: SQLite + Prisma

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
- Hệ thống hiển thị kết quả: Ngay lập tức hiện ra màn hình Điểm số tổng, danh sách các câu hỏi và hiển thị đáp án đúng với những câu làm sai.
- Hệ thống so sánh điểm hiện tại với điểm cao nhất của thí sinh (mặc định là 0), nếu cao hơn thì cập nhật điểm cao nhất.
- Thí sinh có thể chọn tính năng "In phiếu điểm" để xuất ra bản cứng hoặc PDF.

### Giảng viên:
- Giảng viên đăng nhập bằng tài khoản được cấp sẵn.
- Giảng viên tạo môn thi.
- Giảng viên cấu hình môn thi (thời điểm bắt đầu, thời điểm kết thúc, thời lượng bài làm, số câu).
- Giảng viên tải lên file Excel chứa bộ câu hỏi trắc nghiệm. 
- Hệ thống kiểm tra định dạng bảng, trích xuất dữ liệu và lưu vào cơ sở dữ liệu ngân hàng câu hỏi.
- Giảng viên có thể thực hiện CRUD với toàn bộ câu hỏi.
- Giảng viên tải lên file Excel chứa dữ liệu của toàn bộ thí sinh.
- Hệ thống tự tạo tài khoản cho thí sinh (username: mã sinh viên; password: random), lưu vào cơ sở dữ liệu người dùng và tài khoản qua email cho thí sinh.
- Giảng viên có thể thực hiện CRUD đối với dữ liệu thí sinh nếu được yêu cầu.
- Giảng viên có thể xem thông tin và điểm số của thí sinh nhưng không được phép sửa xoá.
- Sau khi môn thi môn thi kết thúc, hệ thống tạo bảng thống kê xếp hạng thí sinh dựa theo điểm số và thời gian làm bài.

## 3.Kiến trúc tối thiểu
### Frontend: 
- Các page chính: Login, Student Dashboard, Exam, Result, History, Teacher Dashboard, Exam Manager, Student Manager, Question Bank, Statistic
- State Management: 
    + Sharing data: Redux
    + Fetching/mutate data: React Query
### Backend:
- Các module chính: auth, user, exam, question bank, testing, grading, statistic
- API: RESful + JWT
### Database: users, exams, questions, exam_attempts, attempt_details

## 4.Phân tích database
### users
- id: Integer, PK, Auto Increment
- username: String, Unique, Not Null
- password: String, Not Null
- email: String, Unique, Not Null
- full_name: String, Not Null
- role: String, Not Null
### exams
- id: Integer, PK, Auto Increment
- name: String, Not Null
- start_time:	 DateTime, Not Null
- end_time: DateTime, Not Null
- duration_mins: Integer, Not Null
- attempts_num: Integer, Default 2
### questions
- id: Integer, PK, Auto Increment
- exam_id: Integer, FK -> Exams(id)
- content: Text, Not Null
- option_a: Text, Not Null	
- option_b: Text, Not Null
- option_c: Text, Not Null	
- option_d: Text, Not Null
- answer: String(1), Not Null
- explain: Text
### exam_attempts:
- id: Integer, PK, Auto Increment
- user_id: Integer, FK -> Users(id)
- exam_id: Integer, FK -> Exams(id)
- attempt_count: Integer, Default 0
- start_time: DateTime, Not Null
- end_time: DateTime, Not Null
- score: Float, Default 0
### attempt_details:
- id: Integer, PK, Auto Increment
- attempt_id: Integer, FK -> Exam_Attempts
- question_id: Integer, FK -> Questions(id)
- user_answer: String(1)
- is_correct: Boolean
### Relation:
- exams		    1:N	questions
- users		    1:N	exam_attempts
- exams		    1:N	exam_attempts
- exam_attempts	1:N	attempt_details
- questions		1:N	attempt_details
- users		    N:N	exams
- exam_attempts	N:N	questions
