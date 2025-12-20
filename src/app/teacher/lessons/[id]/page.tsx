
import TeacherLessonEditor from "@/components/teacher/TeacherLessonEditor";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: PageProps) {
    const { id } = await params;
    return <TeacherLessonEditor lessonId={id} />;
}
