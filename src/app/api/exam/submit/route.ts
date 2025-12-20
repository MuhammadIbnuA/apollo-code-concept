import { NextResponse } from "next/server";
import { db, Question, GradeResult } from "@/lib/db";
import { gradeWithRubric, gradeWithAssertion } from "@/lib/rubricGrader";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { examId, studentName, answers, timeTakenSeconds } = body;

        if (!examId || !studentName || !answers) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate exam exists
        const exam = await db.getExam(examId);
        if (!exam) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        // Server-side grading with rubric engine
        const gradeDetails: Record<string, GradeResult> = {};
        let totalScore = 0;
        let totalPoints = 0;

        for (const question of exam.questions) {
            const q = question as Question;
            const studentCode = answers[q.id] || '';
            totalPoints += q.points;

            // Skip grading if no validation code
            if (!q.validationCode) {
                gradeDetails[q.id] = {
                    questionId: q.id,
                    score: 0,
                    maxScore: q.points,
                    breakdown: {},
                    errors: ['no_validation_code'],
                    status: 'graded'
                };
                continue;
            }

            // Grade based on grading type
            let result: GradeResult;
            if (q.gradingType === 'rubric') {
                result = await gradeWithRubric(
                    studentCode,
                    q.validationCode,
                    q.id,
                    q.points,
                    q.gradingFormat || undefined
                );
            } else {
                // Default: assertion-based grading
                result = await gradeWithAssertion(
                    studentCode,
                    q.validationCode,
                    q.id,
                    q.points
                );
            }

            gradeDetails[q.id] = result;
            totalScore += result.score;
        }

        // Save submission with grade details
        const submission = await db.submitExamAttempt({
            examId,
            studentName,
            score: totalScore,
            answers,
            gradeDetails,
            timeTakenSeconds: timeTakenSeconds || 0,
            timestamp: new Date().toISOString()
        });

        const passed = totalScore >= (totalPoints * 0.6);

        return NextResponse.json({
            success: true,
            message: "Submission graded and saved",
            data: {
                ...submission,
                gradeDetails
            },
            totalPoints,
            totalScore,
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
