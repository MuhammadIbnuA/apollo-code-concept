/**
 * Share Routes
 * POST /api/share - Create shareable lesson
 * GET /api/share/get - Get lesson by ID
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import type { Lesson } from '../lib/types.js';

const router = Router();

/**
 * POST /api/share
 * Create a shareable lesson
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body;
        const {
            title, description, task, content,
            initialCode, expectedOutput, validationCode, validationType
        } = body;

        const newLesson: Lesson = {
            id: uuidv4(),
            title: title || 'Untitled Task',
            description: description || '',
            task: task || '',
            content: content || '',
            initialCode: initialCode || '',
            expectedOutput,
            validationCode,
            validationType: validationType || 'output',
            isPublic: false,
            createdAt: new Date().toISOString()
        };

        await db.saveLesson(newLesson);
        res.json({ success: true, lessonId: newLesson.id });
    } catch (error) {
        console.error('[Share] POST error:', error);
        res.status(500).json({ success: false, error: 'Failed to save lesson' });
    }
});

/**
 * GET /api/share/get
 * Get a lesson by ID
 * Query params: id (required)
 */
router.get('/get', async (req: Request, res: Response): Promise<void> => {
    try {
        const lessonId = req.query.id as string;

        if (!lessonId) {
            res.status(400).json({ error: 'Lesson ID is required' });
            return;
        }

        const lesson = await db.getLesson(lessonId);

        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }

        res.json(lesson);
    } catch (error) {
        console.error('[Share] GET error:', error);
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
});

export default router;
