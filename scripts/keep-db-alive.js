/**
 * Database Keep-Alive Script
 * 
 * This script pings the database to prevent it from going to sleep.
 * Can be run:
 * 1. As a standalone Node.js script: node scripts/keep-db-alive.js
 * 2. Via external cron services (e.g., cron-job.org, easycron.com)
 * 3. Via Vercel Cron (see vercel.json)
 * 
 * For external cron services, set up a job to call:
 * GET https://your-domain.vercel.app/api/cron/keep-alive
 * 
 * Environment: DATABASE_URL must be set
 */

const { Pool } = require('pg');

// Load environment from .env if running locally
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed, assuming env vars are set
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function pingDatabase() {
    const startTime = Date.now();

    try {
        const result = await pool.query('SELECT NOW() as current_time, 1 as ping');
        const dbTime = result.rows[0]?.current_time;
        const responseTime = Date.now() - startTime;

        console.log(`✅ [${new Date().toISOString()}] Database alive!`);
        console.log(`   DB Time: ${dbTime}`);
        console.log(`   Response: ${responseTime}ms`);

        return { success: true, responseTime };
    } catch (error) {
        console.error(`❌ [${new Date().toISOString()}] Database ping failed:`, error.message);
        return { success: false, error: error.message };
    }
}

// Run interval mode if --interval flag is passed
const args = process.argv.slice(2);
const intervalIndex = args.indexOf('--interval');

if (intervalIndex !== -1) {
    const intervalMs = parseInt(args[intervalIndex + 1]) || 60000; // Default 1 minute

    console.log(`🔄 Starting keep-alive loop (interval: ${intervalMs}ms)`);
    console.log('   Press Ctrl+C to stop\n');

    // Initial ping
    pingDatabase();

    // Set up interval
    setInterval(pingDatabase, intervalMs);
} else {
    // Single ping mode
    pingDatabase().then((result) => {
        pool.end();
        process.exit(result.success ? 0 : 1);
    });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    pool.end();
    process.exit(0);
});
