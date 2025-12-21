"use strict";
/**
 * Teacher Routes
 * GET /api/teacher/lessons - List all lessons (including private)
 * POST /api/teacher/lessons - Create/update lesson
 * GET /api/teacher/analytics - Get analytics with optional examId filter
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../db/db.js");
const router = (0, express_1.Router)();
/**
 * GET /api/teacher/lessons
 * Returns all lessons (including private)
 */
router.get('/lessons', async (_req, res) => {
    try {
        const lessons = await db_js_1.db.getLessons(true);
        res.json(lessons);
    }
    catch (error) {
        console.error('[Teacher] GET /lessons error:', error);
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});
/**
 * POST /api/teacher/lessons
 * Create or update a lesson
 */
router.post('/lessons', async (req, res) => {
    try {
        const body = req.body;
        const { id, title, description, task, content, initialCode, expectedOutput, validationCode, validationType, isPublic } = body;
        const lesson = {
            id: id || (0, uuid_1.v4)(),
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
        const saved = await db_js_1.db.saveLesson(lesson);
        res.json(saved);
    }
    catch (error) {
        console.error('[Teacher] POST /lessons error:', error);
        res.status(500).json({ error: 'Failed to save lesson' });
    }
});
/**
 * GET /api/teacher/analytics
 * Returns exam analytics
 * Query params: examId (optional)
 */
router.get('/analytics', async (req, res) => {
    try {
        const examId = req.query.examId;
        if (examId) {
            const analytics = await db_js_1.db.getExamAnalytics(examId);
            res.json(analytics);
        }
        else {
            // Return general submissions if no examId
            const submissions = await db_js_1.db.getAllSubmissions();
            res.json({ submissions });
        }
    }
    catch (error) {
        console.error('[Teacher] GET /analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});
exports.default = router;
//# sourceMappingURL=teacher.js.map