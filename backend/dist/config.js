"use strict";
/**
 * Configuration for Apollo Backend Server
 * All environment variables and configuration settings
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from parent directory (same as Next.js app)
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '../.env') });
// Also try local .env for standalone deployment
dotenv_1.default.config();
exports.config = {
    // Server
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    // Database (PostgreSQL)
    database: {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        database: process.env.PGDATABASE || 'apollo_learning',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    // Judge0 Code Execution
    judge0: {
        apiUrl: process.env.JUDGE0_URL || 'http://129.212.236.32:2358',
        pythonLanguageId: 71, // Python 3.8.1
    },
    // CORS
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
};
//# sourceMappingURL=config.js.map