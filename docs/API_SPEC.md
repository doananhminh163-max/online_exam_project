# API Specification - Online Exam Project

## Overview
All API requests are made to `/api/`. Authentication is required for most endpoints and is handled via JSON Web Tokens (JWT) in the `Authorization` header.

## Authentication
### Login
- **Endpoint:** `POST /api/login`
- **Description:** Authenticate a user and receive a JWT.
- **Request Body:**
```json
{
  "identifier": "username_or_email",
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
    "username": "admin",
    "role": "admin",
    "full_name": "Admin User"
  }
}
```

### Logout
- **Endpoint:** `POST /api/logout`
- **Description:** Terminate the current session (client-side token removal).
- **Response (200 OK):**
```json
{ "message": "Logout successful" }
```

### Get Current User
- **Endpoint:** `GET /api/me`
- **Description:** Get information about the currently logged-in user.
- **Authorization:** `Bearer <token>`
- **Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "full_name": "Admin User"
}
```

## Admin API (Requires Admin Role)
### Get All Exams
- **Endpoint:** `GET /api/exams`
- **Description:** Retrieve a list of all exams.

### Create Exam
- **Endpoint:** `POST /api/exams`
- **Description:** Create a new exam.

### Update Exam
- **Endpoint:** `PUT /api/exams/:id`
- **Description:** Update an existing exam's details.

### Delete Exam
- **Endpoint:** `DELETE /api/exams/:id`
- **Description:** Remove an exam from the system.

## Student API (Requires Token)
### Get Available Exams
- **Endpoint:** `GET /api/student/exams`
- **Description:** Get a list of exams available to the current student.

### Get Exam Details for Taking
- **Endpoint:** `GET /api/student/exams/:id`
- **Description:** Fetch exam details and questions to start an attempt.

### Submit Exam Attempt
- **Endpoint:** `POST /api/student/exams/:id/submit`
- **Description:** Submit answers for an exam and receive a score.
- **Request Body:**
```json
{
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": "B" }
  ]
}
```

### Get Attempt Result
- **Endpoint:** `GET /api/student/results/:attemptId`
- **Description:** Retrieve detailed results for a specific exam attempt.
