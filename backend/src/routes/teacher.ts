/**
 * Teacher Routes
 * GET /api/teacher/lessons - List all lessons (including private)
 * POST /api/teacher/lessons - Create/update lesson
 * GET /api/teacher/analytics - Get analytics with optional examId filter
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import type { Lesson } from '../lib/types.js';

const router = Router();

/**
 * GET /api/teacher/lessons
 * Returns all lessons (including private)
 */
router.get('/lessons', async (_req: Request, res: Response): Promise<void> => {
    try {
        const lessons = await db.getLessons(true);
        res.json(lessons);
    } catch (error) {
        console.error('[Teacher] GET /lessons error:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});

/**
 * POST /api/teacher/lessons
 * Create or update a lesson
 */
router.post('/lessons', async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body;
        const {
            id, title, description, task, content,
            initialCode, expectedOutput, validationCode,
            validationType, isPublic
        } = body;

        const lesson: Lesson = {
            id: id || uuidv4(),
            title: title || 'Untitled Task',
            description: description || '',
            task: task || '',
            content: content || '',
            initialCode: initialCode || '',
            expectedOutput,
            validationCode,
            validationType: validationType || 'output',
            isPublic: isPublic ?? false,
            createdAt: new Date().toISOString()
        };

        const saved = await db.saveLesson(lesson);
        res.json(saved);
    } catch (error) {
        console.error('[Teacher] POST /lessons error:', error);
        res.status(500).json({ error: 'Failed to save lesson' });
    }
});

/**
 * GET /api/teacher/analytics
 * Returns exam analytics
 * Query params: examId (optional)
 */
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
    try {
        const examId = req.query.examId as string | undefined;

        if (examId) {
            const analytics = await db.getExamAnalytics(examId);
            res.json(analytics);
        } else {
            // Return general submissions if no examId
            const submissions = await db.getAllSubmissions();
            res.json({ submissions });
        }
    } catch (error) {
        console.error('[Teacher] GET /analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
