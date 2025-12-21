"use strict";
/**
 * Submit Routes
 * POST /api/submit - Submit lesson attempt
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db/db.js");
const router = (0, express_1.Router)();
/**
 * POST /api/submit
 * Submit a lesson attempt
 */
router.post('/', async (req, res) => {
    try {
        const { lessonId, studentName, status, code } = req.body;
        // Validate required fields
        if (!lessonId || !studentName || !status) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const submission = {
            lessonId,
            studentName,
            status,
            code: code || '',
            timestamp: new Date().toISOString()
        };
        await db_js_1.db.submitAttempt(submission);
        // Calculate new points
        const points = await db_js_1.db.getStudentPoints(studentName);
        res.json({
            success: true,
            message: 'Submission saved',
            newPoints: points
        });
    }
    catch (error) {
        console.error('[Submit] POST error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});
exports.default = router;
//# sourceMappingURL=submit.js.map