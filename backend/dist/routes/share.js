"use strict";
/**
 * Share Routes
 * POST /api/share - Create shareable lesson
 * GET /api/share/get - Get lesson by ID
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_js_1 = require("../db/db.js");
const router = (0, express_1.Router)();
/**
 * POST /api/share
 * Create a shareable lesson
 */
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        const { title, description, task, content, initialCode, expectedOutput, validationCode, validationType } = body;
        const newLesson = {
            id: (0, uuid_1.v4)(),
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
        await db_js_1.db.saveLesson(newLesson);
        res.json({ success: true, lessonId: newLesson.id });
    }
    catch (error) {
        console.error('[Share] POST error:', error);
        res.status(500).json({ success: false, error: 'Failed to save lesson' });
    }
});
/**
 * GET /api/share/get
 * Get a lesson by ID
 * Query params: id (required)
 */
router.get('/get', async (req, res) => {
    try {
        const lessonId = req.query.id;
        if (!lessonId) {
            res.status(400).json({ error: 'Lesson ID is required' });
            return;
        }
        const lesson = await db_js_1.db.getLesson(lessonId);
        if (!lesson) {
            res.status(404).json({ error: 'Lesson not found' });
            return;
        }
        res.json(lesson);
    }
    catch (error) {
        console.error('[Share] GET error:', error);
        res.status(500).json({ error: 'Failed to fetch lesson' });
    }
});
exports.default = router;
//# sourceMappingURL=share.js.map