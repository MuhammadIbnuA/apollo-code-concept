// Shared types that can be used in both client and server components

export interface Question {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    validationCode: string;
    points: number;
    // Rubric scoring fields
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
