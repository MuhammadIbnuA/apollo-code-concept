/**
 * Debug Routes
 * POST /api/debug/grade - Debug grading endpoint
 */

import { Router, Request, Response } from 'express';
import { gradeWithRubric, gradeWithAssertion } from '../lib/rubricGrader.js';

const router = Router();

/**
 * POST /api/debug/grade
 * Debug endpoint for testing grading logic
 */
router.post('/grade', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            studentCode,
            validationCode,
            questionId = 'debug-q1',
            maxPoints = 100,
            gradingType = 'assertion',
            gradingFormat
        } = req.body;

        // Validate required fields
        if (!studentCode || !validationCode) {
            res.status(400).json({
                error: 'Missing required fields',
                required: ['studentCode', 'validationCode']
            });
            return;
        }

        console.log('[Debug] Grading with:', { gradingType, maxPoints });

        let result;
        if (gradingType === 'rubric') {
            result = await gradeWithRubric(
                studentCode,
                validationCode,
                questionId,
                maxPoints,
                gradingFormat
            );
        } else {
            result = await gradeWithAssertion(
                studentCode,
                validationCode,
                questionId,
                maxPoints
            );
        }

        res.json({
            success: true,
            result
        });
    } catch (error) {
        console.error('[Debug] Grade error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            error: 'Grading failed',
            details: message
        });
    }
});

export default router;
