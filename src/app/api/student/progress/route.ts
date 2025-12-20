
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    try {
        const [points, completedLessons] = await Promise.all([
            db.getStudentPoints(name),
            db.getStudentProgress(name)
        ]);

        return NextResponse.json({
            points,
            completedLessons
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }
}
