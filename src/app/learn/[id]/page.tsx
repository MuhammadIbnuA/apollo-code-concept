
import { db } from "@/lib/db";
import StudentWorkspaceWrapper from "@/components/student/StudentWorkspaceWrapper";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function LessonPage({ params }: PageProps) {
    const { id } = await params;
    const lesson = await db.getLesson(id);
    const allLessons = await db.getLessons(); // For sidebar nav

    if (!lesson) {
        notFound();
    }

    return (
        <StudentWorkspaceWrapper lesson={lesson} allLessons={allLessons.filter(l => l.isPublic)} />
    );
}
