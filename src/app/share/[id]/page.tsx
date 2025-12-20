
import ClientOnly from "@/components/ClientOnly";
import LessonView from "@/components/LessonView";
import { Lesson } from "@/lib/db";

// Since we can't do DB calls directly in server component neatly without being async
// and we want to reuse LessonView which is client, let's fetch in a server component wrapper

async function getSharedLesson(id: string) {
    try {
        // Use absolute URL for server-side fetch during SSR or just use DB direct access if we can?
        // Accessing DB directly is better for Server Components in Next.js
        // But we put DB logic in lib/db which uses 'fs', so it works on server only.
        const { db } = await import("@/lib/db");
        return db.getLesson(id);
    } catch {
        return null;
    }
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SharedLessonPage({ params }: PageProps) {
    const { id } = await params;
    const lesson = await getSharedLesson(id as string);

    if (!lesson) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold text-red-500">Lesson Not Found</h1>
                <p>The shared link you clicked is invalid or expired.</p>
            </div>
        );
    }

    return (
        <ClientOnly>
            <LessonView lesson={lesson as Lesson} isShared={true} />
        </ClientOnly>
    );
}
