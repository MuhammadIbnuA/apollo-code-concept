"use strict";
/**
 * Judge0 Proxy Routes
 * POST /api/judge0/submissions - Proxy to Judge0 for code execution
 * GET /api/judge0/submissions/:token - Get submission status
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_js_1 = require("../config.js");
const router = (0, express_1.Router)();
const JUDGE0_URL = config_js_1.config.judge0.apiUrl;
/**
 * POST /api/judge0/submissions
 * Proxy code submission to Judge0
 */
router.post('/submissions', async (req, res) => {
    try {
        const body = req.body;
        console.log(`[Judge0 Proxy] POST ${JUDGE0_URL}/submissions`);
        const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Judge0 Proxy] Error (${response.status}):`, errorText);
            res.status(response.status).json({
                error: 'Judge0 Error',
                details: errorText,
                status: response.status
            });
            return;
        }
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Judge0 Proxy] Network Error:', message);
        res.status(500).json({
            error: 'Failed to submit code',
            details: message
        });
    }
});
/**
 * GET /api/judge0/submissions/:token
 * Get submission status by token
 */
router.get('/submissions/:token', async (req, res) => {
    try {
        const { token } = req.params;
        console.log(`[Judge0 Proxy] GET ${JUDGE0_URL}/submissions/${token}`);
        const response = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,message,compile_output,time,memory`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Judge0 Proxy] Error (${response.status}):`, errorText);
            res.status(response.status).json({
                error: 'Judge0 Error',
                details: errorText
            });
            return;
        }
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Judge0 Proxy] Network Error:', message);
        res.status(500).json({
            error: 'Failed to get submission status',
            details: message
        });
    }
});
exports.default = router;
//# sourceMappingURL=judge0.js.map