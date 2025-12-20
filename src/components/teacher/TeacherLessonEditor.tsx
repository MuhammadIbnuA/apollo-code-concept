"use client";

import React, { useState, useEffect } from "react";
import { Save, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lesson } from "@/lib/db";

interface TeacherLessonEditorProps {
    lessonId?: string; // If undefined, it's new
}

export default function TeacherLessonEditor({ lessonId }: TeacherLessonEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<Partial<Lesson>>({
        title: "",
        description: "",
        content: "# New Lesson\nWrite your theory here...",
        task: "Describe the task...",
        initialCode: "# Write code here",
        validationType: 'output',
        isPublic: false
    });

    useEffect(() => {
        if (lessonId && lessonId !== 'new') {
            setLoading(true);
            // Fetch existing lesson
            fetch(`/api/teacher/lessons`)
                .then(res => res.json())
                // In a real app we'd have a specific GET endpoint or filter here. 
                // For now we just fetch all and find (since list is small).
                // Or I can add a specific endpoint later. 
                // Wait, I implemented db.getLesson but not a specific GET route yet besides query param?
                // Actually I implemented `GET /api/share/get?id=...` before.
                // But honestly, fetching all is fine for MVP or I can fetch /api/share/get?id=X
                .then((data: Lesson[]) => {
                    const found = data.find(l => l.id === lessonId);
                    if (found) setForm(found);
                })
                .finally(() => setLoading(false));
        }
    }, [lessonId]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/teacher/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                router.push('/teacher/lessons');
                router.refresh();
            } else {
                alert("Failed to save");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving");
        } finally {
            setLoading(false);
        }
    };

    if (loading && lessonId !== 'new') return <div className="p-8 text-white">Loading Editor...</div>;

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0d0d15]/80 backdrop-blur-md py-4 z-20 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <Link href="/teacher/lessons" className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-white">{form.id ? 'Edit Lesson' : 'Create New Lesson'}</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                        <Save size={18} /> {loading ? "Saving..." : "Save Lesson"}
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Metadata & Config */}
                <div className="space-y-6">
                    <div className="space-y-4 bg-[#1e1e2e] p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold text-white border-b border-gray-700 pb-2 mb-4">Configuration</h2>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Lesson Title</label>
                            <input
                                className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none"
                                value={form.title || ""}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Intro to Variables"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Short Description</label>
                            <input
                                className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none"
                                value={form.description || ""}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief overview..."
                            />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="isPublic"
                                checked={form.isPublic || false}
                                onChange={e => setForm({ ...form, isPublic: e.target.checked })}
                                className="w-4 h-4 rounded bg-black/40 border-gray-700"
                            />
                            <label htmlFor="isPublic" className="text-sm text-gray-300 select-none cursor-pointer">
                                Publicly Visible in Curriculum?
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4 bg-[#1e1e2e] p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold text-white border-b border-gray-700 pb-2 mb-4">Content</h2>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Theory (Markdown)</label>
                            <textarea
                                className="w-full h-64 bg-black/40 border border-gray-700 rounded p-3 text-white font-mono text-xs focus:border-primary outline-none resize-none"
                                value={form.content || ""}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Task Instructions</label>
                            <textarea
                                className="w-full h-32 bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none"
                                value={form.task || ""}
                                onChange={e => setForm({ ...form, task: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Code & Validation */}
                <div className="space-y-6">
                    <div className="space-y-4 bg-[#1e1e2e] p-6 rounded-xl border border-gray-700">
                        <h2 className="text-lg font-bold text-white border-b border-gray-700 pb-2 mb-4">Code Environment</h2>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Initial Student Code</label>
                            <textarea
                                className="w-full h-48 bg-black/40 border border-gray-700 rounded p-3 text-white font-mono text-xs focus:border-primary outline-none"
                                value={form.initialCode || ""}
                                onChange={e => setForm({ ...form, initialCode: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Validation Type</label>
                                <select
                                    className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white text-sm focus:border-primary outline-none"
                                    value={form.validationType || 'output'}
                                    onChange={e => setForm({ ...form, validationType: e.target.value as any })}
                                >
                                    <option value="output">Expected Output</option>
                                    <option value="code">Hidden Validation Code</option>
                                </select>
                            </div>
                        </div>

                        {form.validationType === 'code' ? (
                            <div>
                                <label className="block text-xs uppercase text-purple-400 font-bold mb-1">Hidden Validation Code (Python)</label>
                                <textarea
                                    className="w-full h-48 bg-purple-900/10 border border-purple-500/30 rounded p-3 text-white font-mono text-xs focus:border-purple-500 outline-none"
                                    placeholder="assert x == 5, 'X must be 5'"
                                    value={form.validationCode || ""}
                                    onChange={e => setForm({ ...form, validationCode: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-2">This code is appended to user's code. Use <code>assert</code> to check variables.</p>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs uppercase text-green-400 font-bold mb-1">Expected Terminal Output</label>
                                <textarea
                                    className="w-full h-48 bg-black/40 border border-gray-700 rounded p-3 text-white font-mono text-xs focus:border-green-500 outline-none"
                                    value={form.expectedOutput || ""}
                                    onChange={e => setForm({ ...form, expectedOutput: e.target.value })}
                                />
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
