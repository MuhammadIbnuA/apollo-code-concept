/**
 * Apollo Backend Server
 * Express API server for Apollo Code Learning Platform
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { ensureDbInitialized } from './db/db.js';

// Import Routes
import adminRoutes from './routes/admin.js';
import teacherRoutes from './routes/teacher.js';
import studentRoutes from './routes/student.js';
import examRoutes from './routes/exam.js';
import shareRoutes from './routes/share.js';
import judge0Routes from './routes/judge0.js';
import submitRoutes from './routes/submit.js';
import debugRoutes from './routes/debug.js';

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS
app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON Body Parser
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================
// ROUTES
// ============================================================

// Health Check
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Root
app.get('/api', (_req: Request, res: Response) => {
    res.json({
        message: 'Apollo Backend API',
        version: '1.0.0',
        endpoints: {
            admin: '/api/admin/exams',
            teacher: '/api/teacher/lessons, /api/teacher/analytics',
            student: '/api/student/progress',
            exam: '/api/exam/:id, /api/exam/submit',
            share: '/api/share, /api/share/get',
            judge0: '/api/judge0/submissions',
            submit: '/api/submit',
            debug: '/api/debug/grade'
        }
    });
});

// Mount Routes
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/judge0', judge0Routes);
app.use('/api/submit', submitRoutes);
app.use('/api/debug', debugRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Error]', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// ============================================================
// SERVER STARTUP
// ============================================================

const startServer = async () => {
    try {
        // Initialize database
        console.log('[Server] Initializing database...');
        await ensureDbInitialized();
        console.log('[Server] Database initialized successfully.');

        // Start listening
        app.listen(config.port, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║          🚀 Apollo Backend Server Started 🚀           ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log(`║  Port:     ${config.port.toString().padEnd(44)}║`);
            console.log(`║  Env:      ${config.nodeEnv.padEnd(44)}║`);
            console.log(`║  CORS:     ${config.cors.origin.padEnd(44)}║`);
            console.log(`║  Judge0:   ${config.judge0.apiUrl.padEnd(44)}║`);
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
};

startServer();
