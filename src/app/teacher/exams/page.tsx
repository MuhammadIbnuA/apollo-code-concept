"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, Plus, Edit2, Share2, Check } from "lucide-react";
import Link from "next/link";
import { Exam } from "@/lib/types";

export default function TeacherExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/exams')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setExams(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const copyShareLink = (examId: string) => {
        const url = `${window.location.origin}/exam/${examId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(examId);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    if (loading) return <div className="p-8 text-foreground">Loading Exams...</div>;

    return (
        <div className="p-8 pb-32 max-w-6xl mx-auto text-foreground">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Exam Management</h1>
                <Link
                    href="/teacher/exams/new"
                    className="flex items-center gap-2 px-4 py-2 bg-success hover:opacity-90 text-success-foreground rounded-lg font-bold transition-colors"
                >
                    <Plus size={20} />
                    Create Exam
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold line-clamp-1" title={exam.title}>{exam.title}</h2>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${exam.isPublic ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                                    }`}>
                                    {exam.isPublic ? "Public" : "Draft"}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{exam.description || "No description provided."}</p>
                            <div className="text-sm text-muted-foreground mb-6">
                                <div>Duration: {exam.durationMinutes} mins</div>
                                <div>Questions: {exam.questions.length}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Link
                                href={`/teacher/exams/${exam.id}/analytics`}
                                className="flex-1 bg-secondary hover:opacity-90 text-secondary-foreground py-2 rounded-lg text-center font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <span>View Results</span>
                            </Link>
                            <Link
                                href={`/teacher/exams/${exam.id}/edit`}
                                className="p-2 bg-primary hover:opacity-90 text-primary-foreground rounded-lg transition-colors"
                                title="Edit Exam"
                            >
                                <Edit2 size={18} />
                            </Link>
                            <button
                                onClick={() => copyShareLink(exam.id)}
                                className={`p-2 rounded-lg transition-colors ${copiedId === exam.id
                                    ? 'bg-success text-success-foreground'
                                    : 'bg-warning hover:opacity-90 text-warning-foreground'
                                    }`}
                                title={copiedId === exam.id ? "Link Copied!" : "Copy Share Link"}
                            >
                                {copiedId === exam.id ? <Check size={18} /> : <Share2 size={18} />}
                            </button>
                            <Link
                                href={`/exam/${exam.id}`}
                                className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                                title="Preview Exam"
                                target="_blank"
                            >
                                <ExternalLink size={18} />
                            </Link>
                        </div>
                    </div>
                ))}

                {exams.length === 0 && (
                    <div className="col-span-full text-center py-10 bg-card rounded-xl border border-border">
                        <p className="text-muted-foreground mb-4">No exams found. Create your first exam!</p>
                        <Link
                            href="/teacher/exams/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-success hover:opacity-90 text-success-foreground rounded-lg font-bold transition-colors"
                        >
                            <Plus size={20} />
                            Create Exam
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
