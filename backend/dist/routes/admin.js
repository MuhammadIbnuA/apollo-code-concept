"use strict";
/**
 * Admin Routes
 * GET /api/admin/exams - List all exams
 * POST /api/admin/exams - Create/update exam
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db/db.js");
const router = (0, express_1.Router)();
/**
 * GET /api/admin/exams
 * Returns all exams
 */
router.get('/exams', async (_req, res) => {
    try {
        const exams = await db_js_1.db.getExams();
        res.json(exams);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('[Admin] GET /exams error:', message);
        res.status(500).json({ error: message });
    }
});
/**
 * POST /api/admin/exams
 * Create or update an exam
 */
router.post('/exams', async (req, res) => {
    try {
        const exam = await db_js_1.db.saveExam(req.body);
        res.json(exam);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('[Admin] POST /exams error:', message);
        res.status(500).json({ error: message });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map