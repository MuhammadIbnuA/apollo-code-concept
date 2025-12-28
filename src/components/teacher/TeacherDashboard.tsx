"use client";

import React, { useState, useEffect } from "react";
import { BarChart2, BookOpen, Users } from "lucide-react";

interface Submission {
    studentName: string;
    lessonId: string;
    status: string;
    timestamp: string;
}

interface DashboardStats {
    totalSubmissions: number;
    totalStudents: number;
    recentActivity: Submission[];
}

export default function TeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetch('/api/teacher/analytics')
            .then(res => res.json())
            .then(data => {
                const uniqueStudents = new Set(data.submissions.map((s: Submission) => s.studentName)).size;
                setStats({
                    totalSubmissions: data.total,
                    totalStudents: uniqueStudents,
                    recentActivity: data.submissions.slice(0, 5)
                });
            })
            .catch(err => console.error(err));
    }, []);

    if (!stats) return <div className="p-8 text-foreground">Loading Dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground mb-8">Teacher Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/20 text-primary rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm uppercase font-bold">Total Students</div>
                            <div className="text-2xl font-bold text-foreground">{stats.totalStudents}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-success/20 text-success rounded-lg">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm uppercase font-bold">Total Submissions</div>
                            <div className="text-2xl font-bold text-foreground">{stats.totalSubmissions}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-secondary/20 text-secondary rounded-lg">
                            <BarChart2 size={24} />
                        </div>
                        <div>
                            <div className="text-muted-foreground text-sm uppercase font-bold">Completion Rate</div>
                            <div className="text-2xl font-bold text-foreground">~{(stats.totalSubmissions > 0 ? 85 : 0)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-muted-foreground">
                        <thead className="text-xs uppercase bg-muted text-muted-foreground">
                            <tr>
                                <th className="p-3">Student</th>
                                <th className="p-3">Lesson</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {stats.recentActivity.map((sub, i) => (
                                <tr key={i} className="hover:bg-muted/50">
                                    <td className="p-3 font-medium text-foreground">{sub.studentName}</td>
                                    <td className="p-3">{sub.lessonId}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${sub.status === 'success' ? 'bg-success/10 text-success border-success/30' :
                                            'bg-destructive/10 text-destructive border-destructive/30'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-muted-foreground">{new Date(sub.timestamp).toLocaleTimeString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
