
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const exams = await db.getExams();
        return NextResponse.json(exams);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const exam = await db.saveExam(body);
        return NextResponse.json(exam);
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
