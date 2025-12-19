import { notFound } from "next/navigation";
import { CURRICULUM } from "@/data/curriculum";
import LessonView from "@/components/LessonView";
import ClientOnly from "@/components/ClientOnly";

// Force static generation for known lessons
export function generateStaticParams() {
    return CURRICULUM.map((lesson) => ({
        lessonId: lesson.id,
    }));
}

interface PageProps {
    params: Promise<{ lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
    const { lessonId } = await params;
    const lesson = CURRICULUM.find((l) => l.id === lessonId);

    if (!lesson) {
        notFound();
    }

    return (
        <ClientOnly>
            <LessonView lesson={lesson} />
        </ClientOnly>
    );
}
