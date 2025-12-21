/**
 * Shared TypeScript Types
 * Used across all API endpoints
 */
export interface Question {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    validationCode: string;
    points: number;
    gradingType?: 'assertion' | 'rubric';
    hints?: string;
    gradingFormat?: string;
}
export interface Exam {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    questions: Question[];
    isPublic: boolean;
    createdAt: string;
}
export interface GradeResult {
    questionId: string;
    score: number;
    maxScore: number;
    breakdown: Record<string, number>;
    errors: string[];
    status: 'graded' | 'error' | 'timeout';
}
export interface ExamSubmission {
    id?: number;
    examId: string;
    studentName: string;
    score: number;
    answers: Record<string, string>;
    gradeDetails?: Record<string, GradeResult>;
    timeTakenSeconds: number;
    timestamp: string;
}
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
export interface ExamAnalytics {
    examTitle: string;
    totalPoints: number;
    completionRate: string;
    passRate: number;
    firstAttemptSuccess: number;
    averageScore: number;
    averageTime: number;
    submissions: ExamSubmission[];
}
export interface StudentProgress {
    studentName: string;
    totalPoints: number;
    completedLessons: number;
    submissions: Submission[];
}
export interface Judge0Response {
    stdout: string | null;
    stderr: string | null;
    status: {
        id: number;
        description: string;
    };
    compile_output: string | null;
    time: string;
    memory: number;
    token?: string;
}
export interface Judge0SubmissionRequest {
    source_code: string;
    language_id: number;
    stdin?: string;
}
//# sourceMappingURL=types.d.ts.map