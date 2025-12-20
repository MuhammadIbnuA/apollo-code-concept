"use client";

import React, { useEffect, useState } from "react";
import { Exam } from "@/lib/db";
import { Clock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExamListPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/exams') // Ideally switch to student specific endpoint later
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Client-side filtering for public exams
                    setExams(data.filter((e: any) => e.isPublic));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-[#0f0f16] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/learn" className="p-2 hover:bg-[#1e1e2e] rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold text-blue-400">Available Exams</h1>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading exams...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.length === 0 ? (
                            <div className="col-span-3 bg-[#1e1e2e] p-8 rounded-lg text-center text-gray-400 border border-[#27273a]">
                                No exams available at the moment. Check back later!
                            </div>
                        ) : (
                            exams.map(exam => (
                                <div key={exam.id} className="bg-[#1e1e2e] rounded-xl border border-[#27273a] overflow-hidden hover:border-blue-500/50 transition-all hover:shadow-lg flex flex-col">
                                    <div className="h-2 bg-blue-600 w-full" />
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                                        <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">{exam.description || "No description provided."}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 font-mono">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} /> {exam.durationMinutes} mins
                                            </div>
                                            <div>{exam.questions.length} Questions</div>
                                        </div>

                                        <Link
                                            href={`/exam/${exam.id}`}
                                            className="w-full py-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-blue-600/20"
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
