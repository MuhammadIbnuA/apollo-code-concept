"use strict";
/**
 * Debug Routes
 * POST /api/debug/grade - Debug grading endpoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rubricGrader_js_1 = require("../lib/rubricGrader.js");
const router = (0, express_1.Router)();
/**
 * POST /api/debug/grade
 * Debug endpoint for testing grading logic
 */
router.post('/grade', async (req, res) => {
    try {
        const { studentCode, validationCode, questionId = 'debug-q1', maxPoints = 100, gradingType = 'assertion', gradingFormat } = req.body;
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
            result = await (0, rubricGrader_js_1.gradeWithRubric)(studentCode, validationCode, questionId, maxPoints, gradingFormat);
        }
        else {
            result = await (0, rubricGrader_js_1.gradeWithAssertion)(studentCode, validationCode, questionId, maxPoints);
        }
        res.json({
            success: true,
            result
        });
    }
    catch (error) {
        console.error('[Debug] Grade error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            error: 'Grading failed',
            details: message
        });
    }
});
exports.default = router;
//# sourceMappingURL=debug.js.map