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
        <div className="min-h-screen bg-[#0f0f16] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Exam Administration</h1>
                    <button
                        onClick={() => window.location.href = '/admin/exam/editor/new'}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold"
                    >
                        <Plus size={20} /> Create New Exam
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-10">Loading exams...</div>
                ) : (
                    <div className="grid gap-4">
                        {exams.length === 0 ? (
                            <div className="bg-[#1e1e2e] p-8 rounded-lg text-center text-gray-400 border border-[#27273a]">
                                No exams found. Create one to get started.
                            </div>
                        ) : (
                            exams.map(exam => (
                                <div key={exam.id} className="bg-[#1e1e2e] p-6 rounded-lg border border-[#27273a] flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{exam.title}</h3>
                                        <div className="text-gray-400 text-sm flex gap-4">
                                            <span>ID: <code className="bg-[#27273a] px-1 rounded">{exam.id}</code></span>
                                            <span>Duration: {exam.durationMinutes}m</span>
                                            <span>Questions: {exam.questions.length}</span>
                                            <span className={exam.isPublic ? "text-green-400" : "text-yellow-400"}>
                                                {exam.isPublic ? "Public" : "Draft"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.location.href = `/admin/exam/${exam.id}/analytics`}
                                            className="p-2 bg-[#27273a] hover:bg-purple-600/20 text-purple-400 rounded-lg"
                                            title="View Analytics"
                                        >
                                            <div className="flex items-center gap-1"><span className="text-xs font-bold">Results</span></div>
                                        </button>
                                        <button
                                            onClick={() => window.location.href = `/admin/exam/editor/${exam.id}`}
                                            className="p-2 bg-[#27273a] hover:bg-blue-600/20 text-blue-400 rounded-lg"
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
