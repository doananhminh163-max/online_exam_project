# 🎓 Hệ Thống Thi Trực Tuyến (Online Exam System)

Hệ thống thi trắc nghiệm trực tuyến hỗ trợ giảng viên quản lý đề thi, ngân hàng câu hỏi và sinh viên tham gia làm bài thi online.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Công nghệ](#-công-nghệ)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Chạy dự án](#-chạy-dự-án)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)

---

## ✨ Tính năng

### 👨‍🏫 Giảng viên (Admin)
- **Quản lý môn thi** — Tạo, sửa, xóa môn thi với thời gian bắt đầu/kết thúc, thời lượng, số lần thi
- **Ngân hàng câu hỏi** — Thêm câu hỏi trắc nghiệm (A/B/C/D) kèm giải thích đáp án
- **Import hàng loạt** — Nhập câu hỏi và danh sách sinh viên từ file Excel/CSV
- **Tự động gửi email** — Gửi mật khẩu đăng nhập qua Gmail cho sinh viên sau khi import
- **Quản lý sinh viên** — Xem, thêm, sửa, xóa tài khoản sinh viên
- **Báo cáo & Thống kê** — Xem kết quả thi, bảng xếp hạng theo môn thi

### 👩‍🎓 Sinh viên (Student)
- **Xem danh sách môn thi** — Hiển thị các môn thi đang mở
- **Làm bài thi online** — Giao diện làm bài trắc nghiệm với bộ đếm thời gian
- **Xem kết quả** — Chi tiết kết quả, đánh dấu đáp án sai, xem giải thích
- **In kết quả** — Xuất kết quả ra bản in
- **Quản lý hồ sơ** — Đổi ảnh đại diện, đổi mật khẩu

---

## 🛠 Công nghệ

| Thành phần | Công nghệ |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, React Router 7 |
| **Backend** | Express 5, TypeScript, tsx |
| **Database** | SQLite (via better-sqlite3) |
| **ORM** | Prisma 7 |
| **Auth** | JWT + bcrypt, HttpOnly cookies |
| **Email** | Nodemailer + Gmail SMTP |
| **UI Icons** | Lucide React |
| **File Import** | xlsx (SheetJS) |

---

## 📁 Cấu trúc dự án

```
online_exam_project/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── public/
│   │   ├── templates/             # File mẫu import (CSV, Excel)
│   │   └── uploads/               # Ảnh đại diện sinh viên
│   └── src/
│       ├── config/
│       │   ├── db.ts              # Prisma client
│       │   └── seed.ts            # Seed data (tài khoản mặc định, môn thi mẫu)
│       ├── controllers/
│       │   ├── admin/             # Controllers cho giảng viên
│       │   │   ├── exam.controller.ts
│       │   │   ├── import.controller.ts
│       │   │   ├── question.controller.ts
│       │   │   ├── report.controller.ts
│       │   │   └── user.controller.ts
│       │   ├── client/            # Controllers cho sinh viên
│       │   └── auth.controller.ts
│       ├── middleware/
│       │   └── auth.ts            # JWT verification, role check
│       ├── routes/
│       │   └── web.ts             # Tất cả API routes
│       ├── services/
│       │   ├── auth.service.ts
│       │   └── email.service.ts   # Gửi email qua Gmail
│       └── app.ts                 # Entry point
├── frontend/
│   └── src/
│       ├── components/            # Shared components
│       ├── pages/                 # Các trang UI
│       │   ├── login/
│       │   ├── teacher-dashboard/
│       │   ├── teacher-exam/
│       │   ├── teacher-question/
│       │   ├── teacher-student/
│       │   ├── teacher-reports/
│       │   ├── student-dashboard/
│       │   ├── student-exam/
│       │   ├── student-results/
│       │   └── student-profile/
│       └── services/
│           └── api.ts             # Axios instance
└── package.json                   # Root scripts (dev, install)
```

---

## 🚀 Cài đặt

### Yêu cầu

- **Node.js** >= 18.x
- **npm** >= 9.x

### Bước 1: Clone repository

```bash
git clone https://github.com/doananhminh163-max/online_exam_project.git
cd online_exam_project
```

### Bước 2: Cài đặt dependencies

```bash
# Cài tất cả (root + backend + frontend)
npm install
npm run install:all
```

### Bước 3: Khởi tạo database

```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## ⚙ Cấu hình

Tạo file `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
PORT=8080

# Gmail SMTP — để tự động gửi mật khẩu cho sinh viên
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Tạo Gmail App Password

1. Đăng nhập Gmail → [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Chọn tên app (vd: "Exam System")
3. Google cấp mật khẩu 16 ký tự → dán vào `GMAIL_APP_PASSWORD`

> **Lưu ý:** Cần bật xác minh 2 bước (2FA) cho tài khoản Gmail trước khi tạo App Password.

---

## ▶ Chạy dự án

### Chế độ Development (chạy cả backend + frontend)

```bash
npm run dev
```

Hoặc chạy riêng:

```bash
# Terminal 1 — Backend (http://localhost:8080)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:5173)
npm run dev:frontend
```

---

## 🔑 Tài khoản mặc định

Hệ thống tự động tạo tài khoản seed khi khởi chạy:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Giảng viên (Admin) | `teacher@exampro.com` | `123456` |
| Sinh viên (Student) | `student@exampro.com` | `123456` |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/login` | Đăng nhập |
| `POST` | `/api/logout` | Đăng xuất |
| `GET` | `/api/me` | Lấy thông tin user hiện tại |

### Admin — Quản lý Môn thi
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/exams` | Danh sách môn thi |
| `POST` | `/api/exams` | Tạo môn thi |
| `PUT` | `/api/exams/:id` | Cập nhật môn thi |
| `DELETE` | `/api/exams/:id` | Xóa môn thi |

### Admin — Quản lý Sinh viên
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/admin/students` | Danh sách sinh viên |
| `POST` | `/api/admin/students` | Thêm sinh viên |
| `PUT` | `/api/admin/students/:id` | Cập nhật sinh viên |
| `DELETE` | `/api/admin/students/:id` | Xóa sinh viên |

### Admin — Import
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/admin/import-students` | Import sinh viên từ Excel/CSV |
| `POST` | `/api/admin/exams/import-questions` | Import câu hỏi từ Excel/CSV |

### Admin — Câu hỏi
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/admin/questions` | Danh sách câu hỏi |
| `POST` | `/api/admin/questions` | Thêm câu hỏi |
| `PUT` | `/api/admin/questions/:id` | Cập nhật câu hỏi |
| `DELETE` | `/api/admin/questions/:id` | Xóa câu hỏi |

### Admin — Báo cáo
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/admin/reports/exams` | Báo cáo kết quả thi |
| `GET` | `/api/admin/reports/exams/:id/ranking` | Bảng xếp hạng theo môn |

### Student — Thi
| Method | Endpoint | Mô tả |
|---|---|---|
| `GET` | `/api/student/exams` | Danh sách môn thi khả dụng |
| `POST` | `/api/student/exams/:id/start` | Bắt đầu làm bài |
| `GET` | `/api/student/exams/:id` | Lấy đề thi |
| `POST` | `/api/student/exams/:id/submit` | Nộp bài thi |
| `GET` | `/api/student/results/:attemptId` | Xem kết quả |

### Student — Hồ sơ
| Method | Endpoint | Mô tả |
|---|---|---|
| `POST` | `/api/student/profile/upload-image` | Upload ảnh đại diện |
| `POST` | `/api/student/profile/change-password` | Đổi mật khẩu |

---

## 🗃 Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│    Users     │     │    Exams     │     │    Questions     │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ id (PK)      │     │ id (PK)      │     │ id (PK)          │
│ code (unique)│     │ name (unique)│     │ exam_id (FK)     │
│ email(unique)│     │ start_time   │     │ content          │
│ password     │     │ end_time     │     │ option_a/b/c/d   │
│ full_name    │     │ duration_mins│     │ answer           │
│ role         │     │ attempts_num │     │ explain          │
│ image        │     │ questions_num│     └──────────────────┘
└──────────────┘     └──────────────┘
        │                    │
        │    ┌───────────────────────┐
        └───>│    ExamAttempts       │
             ├───────────────────────┤
             │ id (PK)              │
             │ user_id (FK)         │
             │ exam_id (FK)         │
             │ start_time           │
             │ end_time             │
             │ score                │
             └───────────────────────┘
                         │
              ┌──────────────────────┐
              │   AttemptDetails     │
              ├──────────────────────┤
              │ id (PK)             │
              │ attempt_id (FK)     │
              │ question_id (FK)    │
              │ user_answer         │
              │ is_correct          │
              └──────────────────────┘
```

---

## 📝 License

ISC

## 👤 Tác giả

**MINH** — [doananhminh163-max](https://github.com/doananhminh163-max)
