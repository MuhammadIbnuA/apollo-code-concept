
import React from "react";
import ExamEditor from "@/components/admin/ExamEditor";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ExamEditorPage({ params }: PageProps) {
    const { id } = await params;
    return <ExamEditor id={id} />;
}
