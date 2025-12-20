
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { examId, studentName, score, answers, timeTakenSeconds } = body;

        if (!examId || !studentName || score === undefined || !answers) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate exam exists
        const exam = await db.getExam(examId);
        if (!exam) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        // Save submission
        const submission = await db.submitExamAttempt({
            examId,
            studentName,
            score,
            answers,
            timeTakenSeconds: timeTakenSeconds || 0,
            timestamp: new Date().toISOString()
        });

        // Calculate total possible points for response context
        const totalPoints = exam.questions.reduce((sum: number, q: { points?: number }) => sum + (q.points || 0), 0);
        const passed = score >= (totalPoints * 0.6); // Simple 60% pass threshold example

        return NextResponse.json({
            success: true,
            message: "Submission saved",
            data: submission, // Return the saved data for verification
            totalPoints,
            passed
        });

    } catch (e: unknown) {
        console.error("Submit error:", e);
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({
            error: "Internal Server Error",
            details: message
        }, { status: 500 });
    }
}
