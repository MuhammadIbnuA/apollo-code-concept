"use client";

import React, { useEffect, useState } from "react";
import { Exam } from "@/lib/types";
import { Plus, Edit } from "lucide-react";

export default function AdminDashboard() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/exams')
            .then(res => res.json())
            .then(data => {
                setExams(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Exam Administration</h1>
                    <button
                        onClick={() => window.location.href = '/admin/exam/editor/new'}
                        className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm"
                    >
                        <Plus size={20} /> Create New Exam
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-muted-foreground py-10">Loading exams...</div>
                ) : (
                    <div className="grid gap-4">
                        {exams.length === 0 ? (
                            <div className="bg-card p-8 rounded-lg text-center text-muted-foreground border border-border">
                                No exams found. Create one to get started.
                            </div>
                        ) : (
                            exams.map(exam => (
                                <div key={exam.id} className="bg-card p-6 rounded-lg border border-border flex items-center justify-between hover:border-primary/50 transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-1">{exam.title}</h3>
                                        <div className="text-muted-foreground text-sm flex gap-4">
                                            <span>ID: <code className="bg-muted px-1 rounded">{exam.id}</code></span>
                                            <span>Duration: {exam.durationMinutes}m</span>
                                            <span>Questions: {exam.questions.length}</span>
                                            <span className={exam.isPublic ? "text-success" : "text-warning"}>
                                                {exam.isPublic ? "Public" : "Draft"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.location.href = `/admin/exam/${exam.id}/analytics`}
                                            className="p-2 bg-muted hover:bg-secondary/20 text-secondary rounded-lg"
                                            title="View Analytics"
                                        >
                                            <div className="flex items-center gap-1"><span className="text-xs font-bold">Results</span></div>
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/admin/exam/editor/${exam.id}`}
                                            className="p-2 bg-muted hover:bg-primary/20 text-primary rounded-lg"
                                            title="Edit Exam"
                                        >
                                            <Edit size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
