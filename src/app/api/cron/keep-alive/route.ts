/**
 * Database Keep-Alive API Route
 * Pings the database every minute to prevent it from sleeping
 * 
 * This is called by Vercel Cron or external cron services
 * GET /api/cron/keep-alive
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Vercel Cron configuration
export const runtime = 'nodejs';

export async function GET(request: Request) {
    // Verify cron secret in production (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();

    try {
        // Simple query to keep database connection alive
        const result = await db.query('SELECT NOW() as current_time, 1 as ping');
        const dbTime = result.rows[0]?.current_time;
        const responseTime = Date.now() - startTime;

        console.log(`[Keep-Alive] Database pinged successfully at ${dbTime} (${responseTime}ms)`);

        return NextResponse.json({
            status: 'ok',
            message: 'Database is awake',
            timestamp: new Date().toISOString(),
            dbTime: dbTime,
            responseTimeMs: responseTime
        });
    } catch (error) {
        console.error('[Keep-Alive] Database ping failed:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Database ping failed',
            error: (error as Error).message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
