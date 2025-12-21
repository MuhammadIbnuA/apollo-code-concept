"use strict";
/**
 * Exam Routes
 * GET /api/exam/:id - Get exam by ID
 * POST /api/exam/submit - Submit exam answers with grading
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_js_1 = require("../db/db.js");
const rubricGrader_js_1 = require("../lib/rubricGrader.js");
const router = (0, express_1.Router)();
/**
 * GET /api/exam/:id
 * Get a specific exam by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const exam = await db_js_1.db.getExam(req.params.id);
        if (!exam) {
            res.status(404).json({ error: 'Exam not found' });
            return;
        }
        res.json(exam);
    }
    catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error('[Exam] GET /:id error:', message);
        res.status(500).json({ error: message });
    }
});
/**
 * POST /api/exam/submit
 * Submit exam answers and grade them
 */
router.post('/submit', async (req, res) => {
    try {
        const { examId, studentName, answers, timeTakenSeconds } = req.body;
        // Validate required fields
        if (!examId || !studentName || !answers) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Validate exam exists
        const exam = await db_js_1.db.getExam(examId);
        if (!exam) {
            res.status(404).json({ error: 'Exam not found' });
            return;
        }
        // Server-side grading with rubric engine
        const gradeDetails = {};
        let totalScore = 0;
        let totalPoints = 0;
        for (const question of exam.questions) {
            const q = question;
            const studentCode = answers[q.id] || '';
            totalPoints += q.points;
            // Skip grading if no validation code
            if (!q.validationCode) {
                gradeDetails[q.id] = {
                    questionId: q.id,
                    score: 0,
                    maxScore: q.points,
                    breakdown: {},
                    errors: ['no_validation_code'],
                    status: 'graded'
                };
                continue;
            }
            // Grade based on grading type
            let result;
            if (q.gradingType === 'rubric') {
                result = await (0, rubricGrader_js_1.gradeWithRubric)(studentCode, q.validationCode, q.id, q.points, q.gradingFormat || undefined);
            }
            else {
                // Default: assertion-based grading
                result = await (0, rubricGrader_js_1.gradeWithAssertion)(studentCode, q.validationCode, q.id, q.points);
            }
            gradeDetails[q.id] = result;
            totalScore += result.score;
        }
        // Save submission with grade details
        const submission = await db_js_1.db.submitExamAttempt({
            examId,
            studentName,
            score: totalScore,
            answers,
            gradeDetails,
            timeTakenSeconds: timeTakenSeconds || 0,
            timestamp: new Date().toISOString()
        });
        const passed = totalScore >= (totalPoints * 0.6);
        res.json({
            success: true,
            message: 'Submission graded and saved',
            data: {
                ...submission,
                gradeDetails
            },
            totalPoints,
            totalScore,
            passed
        });
    }
    catch (e) {
        console.error('[Exam] Submit error:', e);
        const message = e instanceof Error ? e.message : 'Unknown error';
        res.status(500).json({
            error: 'Internal Server Error',
            details: message
        });
    }
});
exports.default = router;
//# sourceMappingURL=exam.js.map