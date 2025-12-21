# Apollo Backend Server

Express.js API server for the Apollo Code Learning Platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp env.example.txt .env
   ```

3. Update `.env` with your database credentials and Judge0 URL.

## Development

```bash
npm run dev
```

Server runs on `http://localhost:4000` by default.

## API Endpoints

| Route | Methods | Description |
|-------|---------|-------------|
| `/health` | GET | Health check |
| `/api` | GET | API info |
| `/api/admin/exams` | GET, POST | Manage exams |
| `/api/teacher/lessons` | GET, POST | Manage lessons |
| `/api/teacher/analytics` | GET | View analytics |
| `/api/student/progress` | GET | Get student progress |
| `/api/exam/:id` | GET | Get exam by ID |
| `/api/exam/submit` | POST | Submit exam answers |
| `/api/share` | POST | Create shared lesson |
| `/api/share/get` | GET | Get shared lesson |
| `/api/judge0/submissions` | POST, GET | Code execution proxy |
| `/api/submit` | POST | Submit lesson attempt |
| `/api/debug/grade` | POST | Debug grading |

## Production Build

```bash
npm run build
npm start
```
