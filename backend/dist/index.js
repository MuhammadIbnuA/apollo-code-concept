"use strict";
/**
 * Apollo Backend Server
 * Express API server for Apollo Code Learning Platform
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_js_1 = require("./config.js");
const db_js_1 = require("./db/db.js");
// Import Routes
const admin_js_1 = __importDefault(require("./routes/admin.js"));
const teacher_js_1 = __importDefault(require("./routes/teacher.js"));
const student_js_1 = __importDefault(require("./routes/student.js"));
const exam_js_1 = __importDefault(require("./routes/exam.js"));
const share_js_1 = __importDefault(require("./routes/share.js"));
const judge0_js_1 = __importDefault(require("./routes/judge0.js"));
const submit_js_1 = __importDefault(require("./routes/submit.js"));
const debug_js_1 = __importDefault(require("./routes/debug.js"));
const app = (0, express_1.default)();
// ============================================================
// MIDDLEWARE
// ============================================================
// CORS
app.use((0, cors_1.default)({
    origin: config_js_1.config.cors.origin,
    credentials: config_js_1.config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// JSON Body Parser
app.use(express_1.default.json({ limit: '10mb' }));
// Request Logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// ============================================================
// ROUTES
// ============================================================
// Health Check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API Root
app.get('/api', (_req, res) => {
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
app.use('/api/admin', admin_js_1.default);
app.use('/api/teacher', teacher_js_1.default);
app.use('/api/student', student_js_1.default);
app.use('/api/exam', exam_js_1.default);
app.use('/api/share', share_js_1.default);
app.use('/api/judge0', judge0_js_1.default);
app.use('/api/submit', submit_js_1.default);
app.use('/api/debug', debug_js_1.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
// Error Handler
app.use((err, _req, res, _next) => {
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
        await (0, db_js_1.ensureDbInitialized)();
        console.log('[Server] Database initialized successfully.');
        // Start listening
        app.listen(config_js_1.config.port, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║          🚀 Apollo Backend Server Started 🚀           ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log(`║  Port:     ${config_js_1.config.port.toString().padEnd(44)}║`);
            console.log(`║  Env:      ${config_js_1.config.nodeEnv.padEnd(44)}║`);
            console.log(`║  CORS:     ${config_js_1.config.cors.origin.padEnd(44)}║`);
            console.log(`║  Judge0:   ${config_js_1.config.judge0.apiUrl.padEnd(44)}║`);
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
        });
    }
    catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map