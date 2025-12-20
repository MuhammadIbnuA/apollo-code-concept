
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const submissions = await db.getAllSubmissions();
        // Here we could also calculate aggregate stats if needed
        return NextResponse.json({
            submissions,
            total: submissions.length
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
