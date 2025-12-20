
import { NextResponse } from 'next/server';
import { db, Lesson } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        // Teacher sees ALL lessons (public + private)
        const lessons = await db.getLessons(true);
        return NextResponse.json(lessons);
    } catch (error) {
        console.error("[API] GET Lessons Error:", error);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, title, description, task, content, initialCode, expectedOutput, validationCode, validationType, isPublic } = body;

        const lesson: Lesson = {
            id: id || uuidv4(),
            title: title || "Untitled Task",
            description: description || "",
            task: task || "",
            content: content || "",
            initialCode: initialCode || "",
            expectedOutput,
            validationCode,
            validationType: validationType || 'output',
            isPublic: isPublic ?? false, // Default to private custom task
            createdAt: new Date().toISOString()
        };

        const saved = await db.saveLesson(lesson);
        return NextResponse.json(saved);

    } catch (error) {
        console.error("Save Lesson Error:", error);
        return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 });
    }
}
