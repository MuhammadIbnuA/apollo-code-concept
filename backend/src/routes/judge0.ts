/**
 * Judge0 Proxy Routes
 * POST /api/judge0/submissions - Proxy to Judge0 for code execution
 * GET /api/judge0/submissions/:token - Get submission status
 */

import { Router, Request, Response } from 'express';
import { config } from '../config.js';

const router = Router();

const JUDGE0_URL = config.judge0.apiUrl;

/**
 * POST /api/judge0/submissions
 * Proxy code submission to Judge0
 */
router.post('/submissions', async (req: Request, res: Response): Promise<void> => {
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
    } catch (error) {
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
router.get('/submissions/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        console.log(`[Judge0 Proxy] GET ${JUDGE0_URL}/submissions/${token}`);

        const response = await fetch(
            `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,message,compile_output,time,memory`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Judge0 Proxy] Network Error:', message);
        res.status(500).json({
            error: 'Failed to get submission status',
            details: message
        });
    }
});

export default router;
