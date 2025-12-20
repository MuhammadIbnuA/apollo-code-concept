
import { NextResponse } from 'next/server';
import { db, SharedLesson } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, task, content, initialCode, expectedOutput, validationCode, validationType } = body;

        const newLesson: SharedLesson = {
            id: uuidv4(),
            title: title || "Untitled Task",
            description: description || "",
            task: task || "",
            content: content || "",
            initialCode: initialCode || "",
            expectedOutput: expectedOutput,
            validationCode: validationCode,
            validationType: validationType || 'output',
            createdAt: new Date().toISOString()
        };

        await db.saveLesson(newLesson);

        return NextResponse.json({ success: true, lessonId: newLesson.id });
    } catch (error) {
        console.error("Save Lesson Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to save lesson' }, { status: 500 });
    }
}
