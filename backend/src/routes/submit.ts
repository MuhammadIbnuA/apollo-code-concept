/**
 * Submit Routes
 * POST /api/submit - Submit lesson attempt
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/db.js';
import type { Submission } from '../lib/types.js';

const router = Router();

/**
 * POST /api/submit
 * Submit a lesson attempt
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId, studentName, status, code } = req.body;

        // Validate required fields
        if (!lessonId || !studentName || !status) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const submission: Submission = {
            lessonId,
            studentName,
            status,
            code: code || '',
            timestamp: new Date().toISOString()
        };

        await db.submitAttempt(submission);

        // Calculate new points
        const points = await db.getStudentPoints(studentName);

        res.json({
            success: true,
            message: 'Submission saved',
            newPoints: points
        });
    } catch (error) {
        console.error('[Submit] POST error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

export default router;
