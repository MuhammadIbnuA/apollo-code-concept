
import { NextResponse } from 'next/server';
import { db, Submission } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { lessonId, studentName, status, code } = body;

        if (!lessonId || !studentName || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const submission: Submission = {
            lessonId,
            studentName,
            status,
            code: code || "",
            timestamp: new Date().toISOString()
        };

        await db.submitAttempt(submission);

        // Calculate new points immediately to update client
        const points = await db.getStudentPoints(studentName);

        return NextResponse.json({ success: true, points });
    } catch (error) {
        console.error("Submission Error:", error);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}
