/**
 * API Client
 * Centralized API client for making requests to the backend
 * Uses Next.js API routes by default (for Vercel)
 * Set NEXT_PUBLIC_API_URL to use external backend
 */

// Use relative path for Vercel (Next.js API routes)
// Set NEXT_PUBLIC_API_URL for external backend (e.g., http://localhost:4000)
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    return response.json();
}

// ============================================================
// API METHODS
// ============================================================

export const api = {
    /**
     * GET request
     */
    get: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return handleResponse<T>(response);
    },

    /**
     * POST request
     */
    post: async <T>(endpoint: string, data: unknown): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse<T>(response);
    },

    /**
     * PUT request
     */
    put: async <T>(endpoint: string, data: unknown): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return handleResponse<T>(response);
    },

    /**
     * DELETE request
     */
    delete: async <T>(endpoint: string): Promise<T> => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return handleResponse<T>(response);
    },
};

// ============================================================
// TYPED API ENDPOINTS
// ============================================================

import type {
    Lesson,
    Exam,
    ExamAnalytics,
    ExamSubmission
} from './types';

export const apiEndpoints = {
    // Admin
    admin: {
        getExams: () => api.get<Exam[]>('/api/admin/exams'),
        saveExam: (exam: Exam) => api.post<Exam>('/api/admin/exams', exam),
    },

    // Teacher
    teacher: {
        getLessons: () => api.get<Lesson[]>('/api/teacher/lessons'),
        saveLesson: (lesson: Lesson) => api.post<Lesson>('/api/teacher/lessons', lesson),
        getAnalytics: (examId?: string) =>
            api.get<ExamAnalytics>(`/api/teacher/analytics${examId ? `?examId=${examId}` : ''}`),
    },

    // Student
    student: {
        getProgress: (name: string) =>
            api.get<{
                studentName: string;
                totalPoints: number;
                completedLessons: number;
                totalLessons: number;
                completedLessonIds: string[];
                lessons: Lesson[];
            }>(`/api/student/progress?name=${encodeURIComponent(name)}`),
    },

    // Exam
    exam: {
        getById: (id: string) => api.get<Exam>(`/api/exam/${id}`),
        submit: (data: {
            examId: string;
            studentName: string;
            answers: Record<string, string>;
            timeTakenSeconds?: number;
        }) => api.post<{
            success: boolean;
            message: string;
            data: ExamSubmission;
            totalPoints: number;
            totalScore: number;
            passed: boolean;
        }>('/api/exam/submit', data),
    },

    // Share
    share: {
        create: (lesson: Partial<Lesson>) =>
            api.post<{ success: boolean; lessonId: string }>('/api/share', lesson),
        get: (id: string) => api.get<Lesson>(`/api/share/get?id=${id}`),
    },

    // Submit (lesson attempts)
    submit: {
        lesson: (data: {
            lessonId: string;
            studentName: string;
            status: 'success' | 'failure' | 'error';
            code?: string;
        }) => api.post<{ success: boolean; newPoints: number }>('/api/submit', data),
    },

    // Debug
    debug: {
        grade: (data: {
            studentCode: string;
            validationCode: string;
            questionId?: string;
            maxPoints?: number;
            gradingType?: 'assertion' | 'rubric';
            gradingFormat?: string;
        }) => api.post<{ success: boolean; result: unknown }>('/api/debug/grade', data),
    },
};

export default api;
