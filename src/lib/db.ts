import 'server-only';
import { Pool } from 'pg';
import { CURRICULUM } from '@/data/curriculum';

// --- DB CONFIGURATION ---
const getDbConfig = () => {
    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) throw new Error("DATABASE_URL is not defined");

    try {
        const dbUrl = new URL(originalUrl);
        dbUrl.searchParams.delete('sslmode');
        console.log("[DB] Connecting to:", dbUrl.toString().replace(/:[^:@]*@/, ':****@'));
        return {
            connectionString: dbUrl.toString(),
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        };
    } catch (e) {
        console.error("[DB] Failed to parse DATABASE_URL", e);
        return {
            connectionString: originalUrl,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        };
    }
};

interface GlobalWithPg { pgPool?: Pool; }
const globalWithPg = global as GlobalWithPg;
const pool = globalWithPg.pgPool || new Pool(getDbConfig());
if (process.env.NODE_ENV !== 'production') globalWithPg.pgPool = pool;

// --- TYPES ---

export interface Lesson {
    id: string;
    title: string;
    description: string;
    task: string;
    content: string;
    initialCode: string;
    expectedOutput?: string;
    validationCode?: string;
    validationType: 'output' | 'code';
    isPublic: boolean;
    createdAt: string;
}

export interface Submission {
    id?: number;
    lessonId: string;
    studentName: string;
    status: 'success' | 'failure' | 'error';
    code: string;
    timestamp: string;
}

export interface Question {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    validationCode: string; // Hidden assertions
    points: number;
}

export interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    questions: Question[]; // Stored as JSON string in DB
    isPublic: boolean;
    createdAt: string;
}

export interface ExamSubmission {
    id?: number;
    examId: string;
    studentName: string;
    score: number;
    answers: any; // JSON
    timeTakenSeconds: number;
    timestamp: string;
}

export interface ExamAnalytics {
    examTitle: string;
    totalPoints: number;
    completionRate: string; // "X / Y" (unique / expected invalid, so just unique count)
    passRate: number;
    firstAttemptSuccess: number;
    averageScore: number;
    averageTime: number; // seconds
    submissions: ExamSubmission[];
}

// --- INITIALIZATION ---
let isInitialized = false;
let initPromise: Promise<void> | null = null;

const seedCurriculum = async (client: any) => {
    // Check if we have any public lessons
    const res = await client.query("SELECT COUNT(*) FROM lessons WHERE is_public = true");
    if (parseInt(res.rows[0].count) === 0) {
        console.log("[DB] Seeding initial curriculum...");
        for (const lesson of CURRICULUM) {
            await client.query(`
                INSERT INTO lessons (id, title, description, task, content, initial_code, expected_output, validation_type, is_public, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                ON CONFLICT (id) DO NOTHING
            `, [
                lesson.id,
                lesson.title,
                lesson.description,
                lesson.task,
                lesson.content,
                lesson.initialCode,
                lesson.expectedOutput,
                'output', // Default validation for curriculum
                true // IS PUBLIC
            ]);
        }
        console.log("[DB] Seeding complete.");
    }
};

const ensureDbInitialized = () => {
    if (isInitialized) return Promise.resolve();

    if (!initPromise) {
        initPromise = (async () => {
            let client;
            try {
                client = await pool.connect();
                await client.query('BEGIN');

                // 1. Lessons Table (Enhanced)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS lessons (
                        id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT,
                        task TEXT,
                        content TEXT,
                        initial_code TEXT,
                        expected_output TEXT,
                        validation_code TEXT,
                        validation_type TEXT DEFAULT 'output',
                        is_public BOOLEAN DEFAULT false,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // 2. Submissions Table (New clean table)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS submissions (
                        id SERIAL PRIMARY KEY,
                        lesson_id TEXT NOT NULL,
                        student_name TEXT NOT NULL,
                        status TEXT NOT NULL,
                        code TEXT,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Add index for fast point calculation
                await client.query(`CREATE INDEX IF NOT EXISTS idx_submissions_student_status ON submissions(student_name, status);`);

                // 4. Exams Table (New)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS exams (
                        id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT,
                        duration_minutes INTEGER,
                        questions TEXT, -- JSON Array
                        is_public BOOLEAN DEFAULT false,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // 5. Exam Submissions Table (New)
                await client.query(`
                    CREATE TABLE IF NOT EXISTS exam_submissions (
                        id SERIAL PRIMARY KEY,
                        exam_id TEXT NOT NULL,
                        student_name TEXT NOT NULL,
                        score INTEGER,
                        answers TEXT, -- JSON Object
                        time_taken_seconds INTEGER DEFAULT 0,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // Migration for existing tables if needed (safe to run)
                const checkCol = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='exam_submissions' AND column_name='time_taken_seconds'
                `);
                if (checkCol.rows.length === 0) {
                    await client.query(`ALTER TABLE exam_submissions ADD COLUMN time_taken_seconds INTEGER DEFAULT 0`);
                }

                // 3. Seed Data
                await seedCurriculum(client);

                await client.query('COMMIT');
                isInitialized = true;
            } catch (e) {
                if (client) await client.query('ROLLBACK');
                console.error("[DB] Failed to init:", e);
                initPromise = null;
                throw e;
            } finally {
                if (client) client.release();
            }
        })();
    }
    return initPromise;
};

// --- DATA ACCESS LAYER ---

export const db = {
    // --- LESSONS ---
    getLessons: async (includePrivate = false) => {
        await ensureDbInitialized();
        let query = `SELECT * FROM lessons`;
        if (!includePrivate) {
            query += ` WHERE is_public = true`;
        }
        query += ` ORDER BY created_at ASC`;

        const res = await pool.query(query);
        return res.rows.map(mapRowToLesson);
    },

    getLesson: async (id: string) => {
        await ensureDbInitialized();
        const res = await pool.query(`SELECT * FROM lessons WHERE id = $1`, [id]);
        if (res.rows.length === 0) return undefined;
        return mapRowToLesson(res.rows[0]);
    },

    saveLesson: async (lesson: Lesson) => {
        await ensureDbInitialized();
        const query = `
            INSERT INTO lessons (id, title, description, task, content, initial_code, expected_output, validation_code, validation_type, is_public, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                task = EXCLUDED.task,
                content = EXCLUDED.content,
                initial_code = EXCLUDED.initial_code,
                expected_output = EXCLUDED.expected_output,
                validation_code = EXCLUDED.validation_code,
                validation_type = EXCLUDED.validation_type,
                is_public = EXCLUDED.is_public
            RETURNING *;
        `;
        const values = [
            lesson.id, lesson.title, lesson.description, lesson.task, lesson.content,
            lesson.initialCode, lesson.expectedOutput, lesson.validationCode,
            lesson.validationType, lesson.isPublic, lesson.createdAt
        ];
        const res = await pool.query(query, values);
        return mapRowToLesson(res.rows[0]);
    },

    // --- SUBMISSIONS & POINTS ---
    submitAttempt: async (submission: Submission) => {
        await ensureDbInitialized();
        const query = `
            INSERT INTO submissions (lesson_id, student_name, status, code, timestamp)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const values = [
            submission.lessonId, submission.studentName, submission.status,
            submission.code, submission.timestamp
        ];
        await pool.query(query, values);
    },

    getStudentPoints: async (studentName: string) => {
        await ensureDbInitialized();
        // Count unique successful lessons * 10
        const query = `
            SELECT COUNT(DISTINCT lesson_id) as passed_count 
            FROM submissions 
            WHERE student_name = $1 AND status = 'success'
        `;
        const res = await pool.query(query, [studentName]);
        const count = parseInt(res.rows[0].passed_count || '0');
        return count * 10;
    },

    getStudentProgress: async (studentName: string) => {
        await ensureDbInitialized();
        const query = `
            SELECT DISTINCT lesson_id 
            FROM submissions 
            WHERE student_name = $1 AND status = 'success'
        `;
        const res = await pool.query(query, [studentName]);
        return res.rows.map(r => r.lesson_id) as string[];
    },

    // --- ANALYTICS ---
    getAllSubmissions: async () => {
        await ensureDbInitialized();
        const res = await pool.query(`SELECT * FROM submissions ORDER BY timestamp DESC LIMIT 100`);
        return res.rows.map(mapRowToSubmission);
    },

    // --- EXAMS ---
    getExams: async () => {
        await ensureDbInitialized();
        const res = await pool.query(`SELECT * FROM exams ORDER BY created_at DESC`);
        return res.rows.map(mapRowToExam);
    },

    getExam: async (id: string) => {
        await ensureDbInitialized();
        const res = await pool.query(`SELECT * FROM exams WHERE id = $1`, [id]);
        if (res.rows.length === 0) return undefined;
        return mapRowToExam(res.rows[0]);
    },

    saveExam: async (exam: Exam) => {
        await ensureDbInitialized();
        const questionsJson = JSON.stringify(exam.questions);
        const query = `
            INSERT INTO exams (id, title, description, duration_minutes, questions, is_public, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                duration_minutes = EXCLUDED.duration_minutes,
                questions = EXCLUDED.questions,
                is_public = EXCLUDED.is_public
            RETURNING *;
        `;
        const values = [
            exam.id, exam.title, exam.description, exam.durationMinutes,
            questionsJson, exam.isPublic, exam.createdAt
        ];
        const res = await pool.query(query, values);
        return mapRowToExam(res.rows[0]);
    },

    submitExamAttempt: async (submission: ExamSubmission) => {
        await ensureDbInitialized();
        const answersJson = JSON.stringify(submission.answers);
        const query = `
            INSERT INTO exam_submissions (exam_id, student_name, score, answers, time_taken_seconds, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [
            submission.examId, submission.studentName, submission.score,
            answersJson, submission.timeTakenSeconds || 0, submission.timestamp
        ];
        const res = await pool.query(query, values);
        return mapRowToExamSubmission(res.rows[0]);
    },

    getExamAnalytics: async (examId: string): Promise<ExamAnalytics> => {
        await ensureDbInitialized();

        // 1. Get Exam Details for Total Points
        const examRes = await pool.query(`SELECT * FROM exams WHERE id = $1`, [examId]);
        if (examRes.rows.length === 0) throw new Error("Exam not found");
        const exam = mapRowToExam(examRes.rows[0]);
        let totalPoints = 0;
        exam.questions.forEach(q => totalPoints += q.points);

        // 2. Get Submissions
        const subRes = await pool.query(`SELECT * FROM exam_submissions WHERE exam_id = $1 ORDER BY timestamp ASC`, [examId]);
        const submissions = subRes.rows.map(mapRowToExamSubmission);

        // 3. Process KPIs
        const uniqueStudents = new Set(submissions.map(s => s.studentName));
        const totalUnique = uniqueStudents.size;

        if (totalUnique === 0) {
            return {
                examTitle: exam.title,
                totalPoints,
                completionRate: "0",
                passRate: 0,
                firstAttemptSuccess: 0,
                averageScore: 0,
                averageTime: 0,
                submissions: []
            };
        }

        // 3a. Pass Rate & Avg Score
        const passingScore = totalPoints * 0.6; // Assume 60% pass
        let studentsPassed = 0;
        let totalBestScore = 0;

        // 3b. First Attempt Success
        let firstAttemptPassCount = 0;

        // 3c. Time
        let totalTimeOfSuccess = 0;
        let successTimeCount = 0;

        const studentBestMap = new Map<string, number>();
        const studentFirstMap = new Map<string, ExamSubmission>();

        submissions.forEach(sub => {
            // First Attempt
            if (!studentFirstMap.has(sub.studentName)) {
                studentFirstMap.set(sub.studentName, sub);
                if (sub.score >= passingScore) {
                    firstAttemptPassCount++;
                }
            }

            // Best Score check
            const currentBest = studentBestMap.get(sub.studentName) || -1;
            if (sub.score > currentBest) {
                studentBestMap.set(sub.studentName, sub.score);
            }

            // Time to First Success (Use the time of the *first* passing submission? Or first valid?)
            // The prompt says "Time to First Success". So if they fail, then pass, we use the time of the pass.
            // But wait, the prompt says "Waktu sampai lulus" (Time until pass).
            // Usually this means sum of time of all attempts until pass? OR just the duration of the passing attempt?
            // "Efisiensi berpikir" (Thinking efficiency) implies duration of the specific attempt. 
            // So I will calculate average "timeTakenSeconds" of ALL SUCCESSFUL submissions? Or just the first successful one per student.
            // Let's use: Average timeTakenSeconds of all submissions that passed.
            if (sub.score >= passingScore) {
                totalTimeOfSuccess += (sub.timeTakenSeconds || 0);
                successTimeCount++;
            }
        });

        // Final Aggregation
        studentBestMap.forEach((score) => {
            totalBestScore += score;
            if (score >= passingScore) studentsPassed++;
        });

        return {
            examTitle: exam.title,
            totalPoints,
            completionRate: totalUnique.toString(),
            passRate: (studentsPassed / totalUnique) * 100,
            firstAttemptSuccess: (firstAttemptPassCount / totalUnique) * 100,
            averageScore: totalBestScore / totalUnique,
            averageTime: successTimeCount > 0 ? (totalTimeOfSuccess / successTimeCount) : 0,
            submissions: submissions.reverse() // Newest first for list
        };
    },

    getExamSubmissions: async (examId?: string) => {
        await ensureDbInitialized();
        let query = `SELECT * FROM exam_submissions`;
        const values: any[] = [];
        if (examId) {
            query += ` WHERE exam_id = $1`;
            values.push(examId);
        }
        query += ` ORDER BY timestamp DESC`;
        const res = await pool.query(query, values);
        return res.rows.map(mapRowToExamSubmission);
    }
};

// Helper Mappers (Extended)
function mapRowToExam(row: any): Exam {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        durationMinutes: row.duration_minutes,
        questions: row.questions ? JSON.parse(row.questions) : [],
        isPublic: row.is_public,
        createdAt: row.created_at
    };
}

function mapRowToExamSubmission(row: any): ExamSubmission {
    return {
        id: row.id,
        examId: row.exam_id,
        studentName: row.student_name,
        score: row.score,
        answers: row.answers ? JSON.parse(row.answers) : {},
        timeTakenSeconds: row.time_taken_seconds || 0,
        timestamp: row.timestamp
    };
}

function mapRowToLesson(row: any): Lesson {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        task: row.task,
        content: row.content,
        initialCode: row.initial_code,
        expectedOutput: row.expected_output,
        validationCode: row.validation_code,
        validationType: row.validation_type,
        isPublic: row.is_public ?? false,
        createdAt: row.created_at
    };
}

function mapRowToSubmission(row: any): Submission {
    return {
        id: row.id,
        lessonId: row.lesson_id,
        studentName: row.student_name,
        status: row.status,
        code: row.code,
        timestamp: row.timestamp
    };
}
