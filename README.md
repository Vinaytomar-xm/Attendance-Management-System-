# Attendance Register — College Attendance Management System

A complete MERN-stack attendance management system with role-based access
(Admin / Teacher / Student), httpOnly-cookie JWT authentication, and a
custom-styled React frontend (no UI library — hand-written CSS).

```
College
   │
  Admin
   │
 ┌─┴───────┐
Teacher   Student
```

## What's inside

```
attendance-backend/     Node.js + Express + MongoDB API
attendance-frontend/    React (Vite) + custom CSS, no Tailwind/UI kit
```

## Security features (backend)

- Passwords hashed with **bcrypt** (cost factor 12), never returned in API responses
- JWT stored in an **httpOnly, sameSite cookie** — never touchable by frontend JS (XSS-safe)
- **Account lockout**: 5 failed logins locks the account for 15 minutes
- **Rate limiting**: strict limiter on `/auth/login`, general limiter on all `/api` routes
- **helmet** for secure HTTP headers
- **express-mongo-sanitize** to block NoSQL injection (`{"$gt": ""}` style payloads)
- **hpp** to block HTTP parameter pollution
- Strict **CORS** — only your configured `CLIENT_URL` origin is allowed, `credentials: true`
- Request body size capped at 10kb
- Centralized error handler that never leaks stack traces to the client
- Server-side **role middleware** (`protect` + `restrictTo`) on every sensitive route
- DB-level unique indexes prevent duplicate attendance sessions / duplicate student marks even under concurrent requests

## Quick start

### 1. Backend

```bash
cd attendance-backend
cp .env.example .env
# edit .env: set MONGO_URI (MongoDB Atlas or local), JWT_SECRET, CLIENT_URL
npm install
node utils/seedAdmin.js     # creates your first admin account (interactive prompt)
npm run dev                 # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd attendance-frontend
cp .env.example .env
# edit .env if your backend isn't on localhost:5000
npm install
npm run dev                 # starts on http://localhost:5173
```

Log in with the admin account you created via `seedAdmin.js`. From the
Admin dashboard you can then create Departments → Subjects → Teachers →
Students, and assign teachers to subjects.

## How the roles work

| Role    | Can do |
|---------|--------|
| Admin   | Full CRUD on departments, subjects, teachers, students. Assigns teachers to subjects. Sees dashboard stats. |
| Teacher | Marks attendance for subjects assigned to them (roster is auto-filtered by the subject's department + semester). Cannot mark a subject they aren't assigned to (enforced server-side, not just hidden in UI). |
| Student | Views their own overall + subject-wise attendance percentage. Cannot view other students' data (enforced server-side). |

## Data model

```
User (role: admin | teacher | student)
Department
Subject (department, semester, assignedTeacher)
Attendance          — one per (teacher, subject, class, date) session
AttendanceRecord     — one per (attendance, student) — the actual mark
```

Attendance and AttendanceRecord are split on purpose: one class session
has many student entries, so splitting keeps each session lightweight
and each student's history queryable via a single indexed field.

## Deployment notes

- **Frontend (Vercel) ↔ Backend (Render)**: since they're on different
  origins, cookies must be `sameSite: "none"; secure: true` in production
  (already handled automatically via `NODE_ENV=production` in
  `utils/generateToken.js`) and CORS `credentials: true` must match on
  both ends (already set).
- Set `CLIENT_URL` in the backend `.env` to your exact deployed frontend
  URL (no trailing slash), and `VITE_API_URL` in the frontend `.env` to
  your deployed backend's `/api` URL.
- Never commit real `.env` files — only `.env.example` is included.

## What's deliberately left for you to extend

- Password reset flow (forgot password email)
- Pagination on large student/teacher lists
- Editing existing attendance marks after the session (currently: re-submitting the same session updates in place only if you add that logic — right now duplicate sessions are blocked, which is a deliberate safeguard you may want to relax for corrections)
- CSV export of attendance

<div align = "center">
  <sub>Made with ❤️ Vinay Singh Tomar</sub>
</div>