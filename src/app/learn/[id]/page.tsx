
import { db } from "@/lib/db";
import StudentWorkspace from "@/components/student/StudentWorkspace";
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
        <StudentWorkspace lesson={lesson} allLessons={allLessons.filter(l => l.isPublic)} />
    );
}
