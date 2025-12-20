"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Exam } from "@/lib/db";

export default function TeacherExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all exams (using admin endpoint for now as it returns list)
        // Ideally we might want a specific teacher endpoint, but this works if open.
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

    if (loading) return <div className="p-8 text-white">Loading Exams...</div>;

    return (
        <div className="p-8 pb-32 max-w-6xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Exam Management & Review</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam.id} className="bg-[#1e1e2e] rounded-xl border border-[#27273a] p-6 hover:border-purple-500/50 transition-all flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold line-clamp-1" title={exam.title}>{exam.title}</h2>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${exam.isPublic ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                                    }`}>
                                    {exam.isPublic ? "Public" : "Draft"}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{exam.description || "No description provided."}</p>
                            <div className="text-sm text-gray-500 mb-6">
                                <div>Duration: {exam.durationMinutes} mins</div>
                                <div>Questions: {exam.questions.length}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Link
                                href={`/teacher/exams/${exam.id}/analytics`}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-center font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <span>View Results</span>
                            </Link>
                            <Link
                                href={`/exam/${exam.id}`}
                                className="p-2 bg-[#27273a] hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                                title="Preview Exam"
                                target="_blank"
                            >
                                <ExternalLink size={18} />
                            </Link>
                        </div>
                    </div>
                ))}

                {exams.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500 bg-[#1e1e2e] rounded-xl border border-[#27273a]">
                        No exams found. Go to Admin Dashboard to create one.
                    </div>
                )}
            </div>
        </div>
    );
}
