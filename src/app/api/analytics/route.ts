
import { NextResponse } from 'next/server';
import { db, StudentResult } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lessonId, studentName, status, code } = body;

        if (!lessonId || !studentName || !status) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        const result: StudentResult = {
            lessonId,
            studentName,
            status,
            code: code || "",
            timestamp: new Date().toISOString()
        };

        await db.saveResult(result);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to save result' }, { status: 500 });
    }
}

export async function GET() {
    // Return all results for the teacher dashboard
    try {
        const results = await db.getResults();
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch results' }, { status: 500 });
    }
}
