"use client";

import React, { useEffect, useState } from "react";
import { Exam } from "@/lib/types";
import { Clock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExamListPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/exams')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setExams(data.filter((e: Exam) => e.isPublic));
                }
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
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/courses" className="p-2 hover:bg-card rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold text-primary">Available Exams</h1>
                </div>

                {loading ? (
                    <div className="text-center text-muted-foreground py-10">Loading exams...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.length === 0 ? (
                            <div className="col-span-3 bg-card p-8 rounded-lg text-center text-muted-foreground border border-border">
                                No exams available at the moment. Check back later!
                            </div>
                        ) : (
                            exams.map(exam => (
                                <div key={exam.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                                    <div className="h-2 bg-primary w-full" />
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-foreground mb-2">{exam.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-3">{exam.description || "No description provided."}</p>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 font-mono">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} /> {exam.durationMinutes} mins
                                            </div>
                                            <div>{exam.questions.length} Questions</div>
                                        </div>

                                        <Link
                                            href={`/exam/${exam.id}`}
                                            className="w-full py-3 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-primary/20"
                                        >
                                            Start Exam <ArrowRight size={16} />
                                        </Link>
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
