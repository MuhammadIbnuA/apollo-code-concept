import ExamEditor from "@/components/admin/ExamEditor";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherEditExamPage({ params }: PageProps) {
    const { id } = await params;
    return <ExamEditor id={id} />;
}
