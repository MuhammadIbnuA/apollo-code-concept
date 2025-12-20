
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('examId');

        if (!examId) {
            // Global Analytics (for TeacherDashboard)
            const submissions = await db.getAllSubmissions();
            return NextResponse.json({
                total: submissions.length,
                submissions: submissions
            });
        }

        const analytics = await db.getExamAnalytics(examId);
        return NextResponse.json(analytics);
    } catch (e: any) {
        console.error("Analytics Error:", e);
        return NextResponse.json({ error: e.message || 'Failed to fetch analytics' }, { status: 500 });
    }
}
