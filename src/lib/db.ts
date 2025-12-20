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
    }
};

// Helper Mappers
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
