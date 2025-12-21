/**
 * Database Layer
 * PostgreSQL connection pool and data access functions
 */
import type { Lesson, Submission, Exam, ExamSubmission, ExamAnalytics } from '../lib/types.js';
export declare const ensureDbInitialized: () => Promise<void>;
export declare const db: {
    getLessons: (includePrivate?: boolean) => Promise<Lesson[]>;
    getLesson: (id: string) => Promise<Lesson | undefined>;
    saveLesson: (lesson: Lesson) => Promise<Lesson>;
    submitAttempt: (submission: Submission) => Promise<void>;
    getStudentPoints: (studentName: string) => Promise<number>;
    getStudentProgress: (studentName: string) => Promise<string[]>;
    getAllSubmissions: () => Promise<Submission[]>;
    getExams: () => Promise<Exam[]>;
    getExam: (id: string) => Promise<Exam | undefined>;
    saveExam: (exam: Exam) => Promise<Exam>;
    submitExamAttempt: (submission: ExamSubmission) => Promise<ExamSubmission>;
    getExamAnalytics: (examId: string) => Promise<ExamAnalytics>;
    getExamSubmissions: (examId?: string) => Promise<ExamSubmission[]>;
};
export default db;
//# sourceMappingURL=db.d.ts.map