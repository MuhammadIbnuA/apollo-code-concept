"use strict";
/**
 * Student Routes
 * GET /api/student/progress - Get student progress by name
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db/db.js");
const router = (0, express_1.Router)();
/**
 * GET /api/student/progress
 * Returns student progress and points
 * Query params: name (required)
 */
router.get('/progress', async (req, res) => {
    try {
        const studentName = req.query.name;
        if (!studentName) {
            res.status(400).json({ error: 'Student name is required' });
            return;
        }
        const [points, completedLessons, allLessons] = await Promise.all([
            db_js_1.db.getStudentPoints(studentName),
            db_js_1.db.getStudentProgress(studentName),
            db_js_1.db.getLessons(false) // Public lessons only
        ]);
        res.json({
            studentName,
            totalPoints: points,
            completedLessons: completedLessons.length,
            totalLessons: allLessons.length,
            completedLessonIds: completedLessons,
            lessons: allLessons
        });
    }
    catch (error) {
        console.error('[Student] GET /progress error:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});
exports.default = router;
//# sourceMappingURL=student.js.map