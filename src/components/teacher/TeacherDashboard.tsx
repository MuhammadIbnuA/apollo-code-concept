"use client";

import React, { useState, useEffect } from "react";
import { BarChart2, BookOpen, Users } from "lucide-react";

interface DashboardStats {
    totalSubmissions: number;
    totalStudents: number; // Derived from unique names in submissions
    recentActivity: any[];
}

export default function TeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        // Fetch global analytics
        fetch('/api/teacher/analytics')
            .then(res => res.json())
            .then(data => {
                const uniqueStudents = new Set(data.submissions.map((s: any) => s.studentName)).size;
                setStats({
                    totalSubmissions: data.total,
                    totalStudents: uniqueStudents,
                    recentActivity: data.submissions.slice(0, 5)
                });
            })
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <div className="p-8 text-white">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Teacher Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1e1e2e] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm uppercase font-bold">Total Students</div>
                            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e1e2e] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm uppercase font-bold">Total Submissions</div>
                            <div className="text-2xl font-bold text-white">{stats.totalSubmissions}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e1e2e] p-6 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm uppercase font-bold">Completion Rate</div>
                            {/* Mock calculation for now */}
                            <div className="text-2xl font-bold text-white">~{(stats.totalSubmissions > 0 ? 85 : 0)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#1e1e2e] p-6 rounded-xl border border-gray-700 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs uppercase bg-black/20 text-gray-500">
                            <tr>
                                <th className="p-3">Student</th>
                                <th className="p-3">Lesson</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {stats.recentActivity.map((sub, i) => (
                                <tr key={i} className="hover:bg-white/5">
                                    <td className="p-3 font-medium text-white">{sub.studentName}</td>
                                    <td className="p-3">{sub.lessonId}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${sub.status === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                'bg-red-500/10 text-red-400 border-red-500/30'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-gray-500">{new Date(sub.timestamp).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
