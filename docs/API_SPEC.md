# API Specification - Online Exam Project

## Overview
All API requests are made to `/api/`. Authentication is handled via JSON Web Tokens (JWT) stored in HTTP-Only Cookies. The cookie is automatically sent by the browser with each request.

## Authentication
### Login
- **Endpoint:** `POST /api/login`
- **Description:** Authenticate a user and receive a JWT via HTTP-Only Cookie.
- **Request Body:**
```json
{
  "identifier": "student_code_or_email",
  "password": "user_password"
}
```
- **Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "code": "SV001",
    "role": "admin",
    "full_name": "Admin User"
  }
}
```
- **Side Effect:** Sets an HTTP-Only Cookie containing the JWT.

### Logout
- **Endpoint:** `POST /api/logout`
- **Description:** Clear the authentication cookie.
- **Response (200 OK):**
```json
{ "message": "Logout successful" }
```

### Get Current User
- **Endpoint:** `GET /api/me`
- **Description:** Get information about the currently logged-in user (session restoration).
- **Authorization:** HTTP-Only Cookie (automatic)
- **Response (200 OK):**
```json
{
  "id": 1,
  "code": "SV001",
  "full_name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "image": "/uploads/profile/profile-1-xxx.jpg"
}
```

---

## Admin API (Requires Admin Role)

### Exam Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/exams` | Retrieve a list of all exams |
| `POST` | `/api/exams` | Create a new exam |
| `PUT` | `/api/exams/:id` | Update an existing exam |
| `DELETE` | `/api/exams/:id` | Delete an exam |

### Dashboard Statistics
- **Endpoint:** `GET /api/admin/dashboard-stats`
- **Description:** Retrieve aggregated statistics for the admin dashboard.

### Import Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/import-students` | Import students from Excel/CSV file (Multipart/form-data). Auto-generates passwords and sends email notifications via Gmail SMTP. |
| `POST` | `/api/admin/exams/import-questions` | Import question bank from Excel/CSV file (Multipart/form-data). Maps questions to exams by "Exam Name" column. |

### Question Bank Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/questions` | Retrieve all questions (supports `?exam_id=` filter) |
| `POST` | `/api/admin/questions` | Create a new question |
| `PUT` | `/api/admin/questions/:id` | Update an existing question |
| `DELETE` | `/api/admin/questions/:id` | Delete a question |

### Student Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/students` | Retrieve all students |
| `POST` | `/api/admin/students` | Create a new student |
| `PUT` | `/api/admin/students/:id` | Update student information |
| `DELETE` | `/api/admin/students/:id` | Delete a student |

### Reports & Rankings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/reports/exams` | Get exam-level report summaries |
| `GET` | `/api/admin/reports/exams/:id/ranking` | Get student ranking for a specific exam |

---

## Student API (Requires Token)

### Exam Flow
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/student/exams` | Get list of available exams with attempt counts |
| `POST` | `/api/student/exams/:id/start` | Start an exam attempt (creates ExamAttempt record) |
| `GET` | `/api/student/exams/:id` | Fetch exam questions for an ongoing attempt |
| `POST` | `/api/student/exams/:id/submit` | Submit answers and receive score |
| `GET` | `/api/student/results/:attemptId` | Retrieve detailed results for a specific attempt |

#### Submit Exam Request Body:
```json
{
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": "B" }
  ]
}
```

### Profile Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/student/profile/upload-image` | Upload profile avatar (Multipart/form-data, max 2MB, jpg/png/webp) |
| `POST` | `/api/student/profile/change-password` | Change user password |
