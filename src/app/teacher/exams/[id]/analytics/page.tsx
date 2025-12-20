"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, Award, Users, Target, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ExamAnalytics, ExamSubmission } from "@/lib/db";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TeacherAnalyticsPage({ params }: PageProps) {
    const { id } = React.use(params);
    const [data, setData] = useState<ExamAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

    useEffect(() => {
        fetch(`/api/teacher/analytics?examId=${id}`)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-10 text-white">Loading Analytics...</div>;
    if (!data) return <div className="p-10 text-white">Exam not found or no data.</div>;

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}m ${s}s`;
    };

    return (
        <div className="text-white pb-32">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0d0d15]/80 backdrop-blur-md py-4 z-20 border-b border-gray-800 px-8">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/exams" className="flex items-center text-gray-400 hover:text-white">
                        <ArrowLeft size={18} className="mr-2" /> Back to Exams
                    </Link>
                    <h1 className="text-xl font-bold text-white">{data.examTitle} Analytics</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <KpiCard
                        title="Completion"
                        value={data.completionRate}
                        icon={<Users size={20} className="text-blue-400" />}
                        desc="Unique Students"
                    />
                    <KpiCard
                        title="Pass Rate"
                        value={`${data.passRate.toFixed(1)}%`}
                        icon={<Award size={20} className="text-green-400" />}
                        desc="All Attempts"
                    />
                    <KpiCard
                        title="First Success"
                        value={`${data.firstAttemptSuccess.toFixed(1)}%`}
                        icon={<Target size={20} className="text-yellow-400" />}
                        desc="1st Try Pass"
                    />
                    <KpiCard
                        title="Avg Score"
                        value={data.averageScore.toFixed(1)}
                        icon={<CheckCircle size={20} className="text-purple-400" />}
                        desc={`/ ${data.totalPoints}`}
                    />
                    <KpiCard
                        title="Time to Success"
                        value={formatTime(data.averageTime)}
                        icon={<Clock size={20} className="text-orange-400" />}
                        desc="Avg Duration"
                    />
                </div>

                {/* Submissions Table */}
                <div className="bg-[#1e1e2e] rounded-xl border border-[#27273a] overflow-hidden">
                    <div className="p-6 border-b border-[#27273a]">
                        <h2 className="text-xl font-bold">Student Submissions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#161622] text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Time Taken</th>
                                    <th className="p-4">Submitted At</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27273a]">
                                {data.submissions.map((sub, idx) => (
                                    <tr key={idx} className="hover:bg-[#27273a] transition-colors">
                                        <td className="p-4 font-bold text-white">{sub.studentName}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${sub.score >= (data.totalPoints * 0.6) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {sub.score} / {data.totalPoints}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-300">
                                            {formatTime(sub.timeTakenSeconds)}
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">
                                            {new Date(sub.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setSelectedSubmission(sub)}
                                                className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                                            >
                                                View Code
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data.submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No submissions yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submission Detail Modal */}
                {selectedSubmission && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#1e1e2e] w-full max-w-4xl h-[80vh] rounded-xl border border-[#27273a] flex flex-col shadow-2xl">
                            <div className="p-4 border-b border-[#27273a] flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedSubmission.studentName}'s Submission</h3>
                                    <p className="text-gray-400 text-sm">Score: {selectedSubmission.score}</p>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-white/10 rounded">X</button>
                            </div>
                            <div className="flex-1 overflow-auto p-0 flex flex-col md:flex-row">
                                <div className="flex-1 p-4 border-r border-[#27273a] bg-[#0f0f16]">
                                    <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">Answers Code</h4>
                                    <div className="space-y-4">
                                        {Object.entries(selectedSubmission.answers).map(([qId, code]) => (
                                            <div key={qId} className="mb-4">
                                                <div className="text-xs text-blue-400 mb-1 font-mono">{qId}</div>
                                                <pre className="p-3 bg-[#161622] rounded border border-[#27273a] text-xs font-mono overflow-x-auto text-gray-300">
                                                    {code as string}
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon, desc }: { title: string, value: string | number, icon: any, desc: string }) {
    return (
        <div className="bg-[#1e1e2e] p-4 rounded-xl border border-[#27273a] flex flex-col items-center text-center hover:border-blue-500/30 transition-all">
            <div className="mb-2 p-2 bg-[#161622] rounded-full border border-[#27273a]">{icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm font-bold text-gray-400">{title}</div>
            <div className="text-xs text-gray-600 mt-1">{desc}</div>
        </div>
    );
}
