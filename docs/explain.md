# Quy trình Giao tiếp Frontend - Backend (Online Exam Project)

Tài liệu này giải thích chi tiết cách ứng dụng Frontend (React) tương tác và trao đổi dữ liệu với Backend (Node.js/Express), đặc biệt tập trung vào cơ chế xác thực bảo mật thông qua HTTP-Only Cookie.

---

## 1. Kiến trúc Giao tiếp Tổng thể (Client - Server)

Hệ thống được thiết kế theo mô hình **Client-Server** phân tách hoàn toàn (Decoupled Architecture):
*   **Frontend (Client):** Xây dựng bằng React & Vite, chạy trên cổng `http://localhost:5173`. Giao diện này chịu trách nhiệm hiển thị thông tin và nhận tương tác từ người dùng.
*   **Backend (Server):** Xây dựng bằng Node.js & Express, chạy độc lập trên cổng `http://localhost:8080`. Đây là trung tâm xử lý nghiệp vụ và tương tác với cơ sở dữ liệu.

Hai hệ thống này không chia sẻ mã nguồn hay bộ nhớ. Chúng giao tiếp với nhau hoàn toàn thông qua **HTTP RESTful API**. Ngôn ngữ chung để trao đổi dữ liệu là định dạng **JSON** (JavaScript Object Notation).

---

## 2. Cầu nối giao tiếp: CORS và Axios

Vì Frontend và Backend chạy trên hai "nguồn" (Origin) khác nhau (cổng 5173 và 8080), trình duyệt web mặc định sẽ chặn các Request gửi từ Frontend sang Backend vì lý do bảo mật (Chính sách Same-Origin Policy). 

Để cho phép chúng nói chuyện với nhau, chúng ta cần cấu hình **CORS** (Cross-Origin Resource Sharing):

*   **Tại Backend (Express):** Chúng ta cấu hình middleware `cors` để chỉ đích danh cho phép origin `http://localhost:5173` được phép truy cập, đồng thời bật cờ `credentials: true` để cho phép nhận Cookie từ nguồn này.
    ```typescript
    // backend/src/app.ts
    app.use(cors({
        origin: "http://localhost:5173",
        credentials: true
    }));
    ```

*   **Tại Frontend (React):** Thư viện `axios` được sử dụng để gửi API. Nó được cấu hình mặc định để gửi kèm thuộc tính `withCredentials: true`. Điều này cực kỳ quan trọng, nó ra lệnh cho trình duyệt: *"Hãy luôn đính kèm Cookie của localhost:8080 vào mỗi request gửi đi"*.
    ```typescript
    // frontend/src/services/api.ts
    const api = axios.create({
      baseURL: 'http://localhost:8080/api',
      withCredentials: true 
    });
    ```

---

## 3. Quy trình Xác thực an toàn (Authentication Flow với HTTP-Only Cookie)

Thay vì lưu Token đăng nhập ở `localStorage` hoặc `sessionStorage` (nơi rất dễ bị hacker đánh cắp qua lỗ hổng XSS), dự án sử dụng **HTTP-Only Session Cookie**. Dưới đây là luồng hoạt động chi tiết:

### Bước 1: Quá trình Đăng nhập (Login)
1. Thí sinh/Giảng viên nhập tài khoản và mật khẩu trên form Frontend.
2. Frontend dùng Axios gửi `POST /api/login` kèm dữ liệu dạng JSON.
3. Backend kiểm tra Database. Nếu đúng, Backend sinh ra một chuỗi mã hóa gọi là **JWT Token**.
4. **Điểm mấu chốt:** Thay vì trả Token về cho Frontend dưới dạng Data, Backend đóng gói Token này vào một **Cookie**.
   Cookie này được cấu hình cờ `httpOnly: true`. Cờ này ra lệnh cho trình duyệt: *"Hãy cất kỹ Cookie này đi, tuyệt đối không cho bất kỳ đoạn mã JavaScript nào (kể cả của Frontend) đọc được nó"*.
5. Backend trả về thư phản hồi thành công (HTTP 200) kèm lệnh Set-Cookie.

### Bước 2: Các Request tiếp theo
Khi Frontend cần lấy danh sách môn thi (`GET /api/exams`), Frontend **không cần** tự tay lấy Token gắn vào Header. 
Nhờ cấu hình `withCredentials: true` ở bước 2, Trình duyệt sẽ **tự động** moi cái HTTP-Only Cookie đang cất giấu ra và đính kèm vào Request gửi lên Backend. Backend chỉ việc mở Cookie ra và xác nhận người dùng.

### Bước 3: Đóng trình duyệt và Khôi phục phiên (Session Cookie)
*   **Session Cookie:** Cookie chứa Token không được cài đặt thời gian sống (`maxAge`). Do đó trình duyệt hiểu đây là một "Session Cookie". **Ngay khi bạn đóng toàn bộ cửa sổ trình duyệt, Cookie này sẽ bị xóa sổ vĩnh viễn**, dẫn đến việc bạn bị đăng xuất.
*   **Mở Tab mới / Tải lại trang:** Vì Frontend React là một ứng dụng SPA (Single Page Application), mỗi khi bạn f5 hoặc mở tab mới, các biến State (`user`) của React sẽ bị reset về 0. 
    Để không bắt người dùng đăng nhập lại, React Context (`AuthContext`) sẽ tự động gọi API `GET /api/me`. Do trình duyệt tự động gửi kèm Cookie, Backend sẽ nhận dạng được bạn là ai và trả về thông tin User. Frontend lấy thông tin này khôi phục lại trạng thái "Đã đăng nhập" một cách trơn tru.

---

## 4. Vòng đời của một Request thông thường (The Request Lifecycle)

Khi một chức năng được kích hoạt (ví dụ: Nộp bài thi), luồng dữ liệu sẽ trải qua một vòng đời khép kín như sau:

1.  **Frontend (React Component):** Bắt sự kiện người dùng (Click "Nộp bài"), gom nhặt dữ liệu đáp án.
2.  **Frontend (Axios):** Đóng gói dữ liệu thành JSON và bắn HTTP POST lên URL `/api/student/exams/1/submit`. Trình duyệt tự động chèn Cookie bảo mật.
3.  **Backend (Express Routes):** Đường dẫn `/api/...` được định tuyến trong file `web.ts` tiếp nhận Request.
4.  **Backend (Middleware):** Request phải đi qua trạm kiểm soát `verifyToken` (`middleware/auth.ts`). Trạm này mở Cookie, giải mã JWT Token. Nếu hợp lệ, nó cho đi tiếp.
5.  **Backend (Controller):** Hàm `submitExam` trong Controller (`exam.controller.ts`) nhận Request, lấy dữ liệu đáp án và ID sinh viên.
6.  **Backend (Service & Prisma):** Controller không tự làm việc với Database, nó gọi `clientExamService.submitExamAttempt(...)`. Service này dùng **Prisma ORM** để ra lệnh cho CSDL SQLite chấm điểm và lưu kết quả.
7.  **Backend (Response):** Service trả điểm số về cho Controller. Controller đóng gói điểm số thành JSON và `res.json(...)` gửi ngược lại.
8.  **Frontend (React Component):** Axios nhận được JSON. React cập nhật State (Điểm số) và tự động vẽ lại giao diện (Render) hiển thị kết quả cho Thí sinh. 
*(Hoàn tất 1 vòng đời)*
