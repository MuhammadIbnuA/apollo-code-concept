/**
 * Admin Routes
 * GET /api/admin/exams - List all exams
 * POST /api/admin/exams - Create/update exam
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/db.js';

const router = Router();

/**
 * GET /api/admin/exams
 * Returns all exams
 */
router.get('/exams', async (_req: Request, res: Response): Promise<void> => {
    try {
        const exams = await db.getExams();
        res.json(exams);
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('[Admin] GET /exams error:', message);
        res.status(500).json({ error: message });
    }
});

/**
 * POST /api/admin/exams
 * Create or update an exam
 */
router.post('/exams', async (req: Request, res: Response): Promise<void> => {
    try {
        const exam = await db.saveExam(req.body);
        res.json(exam);
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('[Admin] POST /exams error:', message);
        res.status(500).json({ error: message });
    }
});

export default router;
