"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Link as LinkIcon, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { Lesson } from "@/lib/types";

export default function LessonManager() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLessons = async () => {
        try {
            const res = await fetch('/api/teacher/lessons');
            const data = await res.json();
            if (Array.isArray(data)) setLessons(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const copyShareLink = (id: string) => {
        const url = `${window.location.origin}/share/${id}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    if (loading) return <div className="text-white p-8">Loading Lessons...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Lesson Manager</h1>
                <Link href="/teacher/lessons/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> Create New Task
                </Link>
            </div>

            <div className="bg-[#1e1e2e] border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs uppercase bg-black/40 text-gray-500 font-bold border-b border-gray-700">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Visibility</th>
                            <th className="p-4">Created At</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {lessons.map((lesson) => (
                            <tr key={lesson.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{lesson.title}</td>
                                <td className="p-4 text-gray-400 truncate max-w-xs">{lesson.description || "No description"}</td>
                                <td className="p-4">
                                    {lesson.isPublic ? (
                                        <span className="flex items-center gap-1 text-green-400 text-xs px-2 py-0.5 bg-green-900/20 border border-green-500/20 rounded">
                                            <Globe size={12} /> Public
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-yellow-400 text-xs px-2 py-0.5 bg-yellow-900/20 border border-yellow-500/20 rounded">
                                            <Lock size={12} /> Private Link
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-gray-500 text-xs">{new Date(lesson.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => copyShareLink(lesson.id)}
                                            className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 hover:text-white" title="Copy Share Link"
                                        >
                                            <LinkIcon size={16} />
                                        </button>
                                        <Link
                                            href={`/teacher/lessons/${lesson.id}`}
                                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-400 hover:text-blue-200 rounded" title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {lessons.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No lessons found. Create one to get started!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
