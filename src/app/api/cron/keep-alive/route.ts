/**
 * Database Keep-Alive API Route
 * Pings the database every minute to prevent it from sleeping
 * 
 * This is called by external cron services like cron-job.org
 * GET /api/cron/keep-alive
 */

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create a simple pool for ping
function createPool() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return null;

    return new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });
}

export async function GET(request: Request) {
    // Verify cron secret in production (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const pool = createPool();

    if (!pool) {
        return NextResponse.json({
            status: 'error',
            message: 'DATABASE_URL not configured',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }

    try {
        // Simple query to keep database connection alive
        const result = await pool.query('SELECT NOW() as current_time, 1 as ping');
        const dbTime = result.rows[0]?.current_time;
        const responseTime = Date.now() - startTime;

        console.log(`[Keep-Alive] Database pinged successfully at ${dbTime} (${responseTime}ms)`);

        await pool.end();

        return NextResponse.json({
            status: 'ok',
            message: 'Database is awake',
            timestamp: new Date().toISOString(),
            dbTime: dbTime,
            responseTimeMs: responseTime
        });
    } catch (error) {
        console.error('[Keep-Alive] Database ping failed:', error);

        try { await pool.end(); } catch { }

        return NextResponse.json({
            status: 'error',
            message: 'Database ping failed',
            error: (error as Error).message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
