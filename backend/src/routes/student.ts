/**
 * Student Routes
 * GET /api/student/progress - Get student progress by name
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/db.js';

const router = Router();

/**
 * GET /api/student/progress
 * Returns student progress and points
 * Query params: name (required)
 */
router.get('/progress', async (req: Request, res: Response): Promise<void> => {
    try {
        const studentName = req.query.name as string;

        if (!studentName) {
            res.status(400).json({ error: 'Student name is required' });
            return;
        }

        const [points, completedLessons, allLessons] = await Promise.all([
            db.getStudentPoints(studentName),
            db.getStudentProgress(studentName),
            db.getLessons(false) // Public lessons only
        ]);

        res.json({
            studentName,
            totalPoints: points,
            completedLessons: completedLessons.length,
            totalLessons: allLessons.length,
            completedLessonIds: completedLessons,
            lessons: allLessons
        });
    } catch (error) {
        console.error('[Student] GET /progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

export default router;
