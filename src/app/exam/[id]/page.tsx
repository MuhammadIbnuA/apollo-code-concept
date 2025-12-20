import React from "react";
import { db } from "@/lib/db";
import ExamInterface from "@/components/exam/ExamInterface";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ExamPage({ params }: PageProps) {
    const { id } = await params;

    const exam = await db.getExam(id);

    if (!exam) {
        notFound();
    }

    return <ExamInterface exam={exam} />;
}
