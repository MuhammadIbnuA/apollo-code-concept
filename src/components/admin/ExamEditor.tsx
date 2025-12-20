"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash, Save, ArrowLeft } from "lucide-react";
import { Exam, Question } from "@/lib/db";
import { useRouter } from "next/navigation";

const CodeEditor = dynamic(() => import("@/components/Editor/CodeEditor"), { ssr: false });

interface ExamEditorProps {
    id: string;
}

export default function ExamEditor({ id }: ExamEditorProps) {
    const router = useRouter();
    const isNew = id === 'new';

    const [exam, setExam] = useState<Partial<Exam> & { questions: Question[] }>({
        id: isNew ? "" : id,
        title: "",
        description: "",
        durationMinutes: 60,
        questions: [],
        isPublic: false
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isNew) {
            fetch('/api/admin/exams')
                .then(res => res.json())
                .then((exams: Exam[]) => {
                    const found = exams.find(e => e.id === id);
                    if (found) setExam(found);
                    setLoading(false);
                });
        }
    }, [id, isNew]);

    const addQuestion = () => {
        const newQ: Question = {
            id: `q-${Date.now()}`,
            title: "New Question",
            description: "Describe the problem...",
            initialCode: "# Write code here",
            validationCode: "# assert x == 1",
            points: 10
        };
        setExam(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    };

    const updateQuestion = (idx: number, field: keyof Question, value: string | number) => {
        const newQuestions = [...exam.questions];
        newQuestions[idx] = { ...newQuestions[idx], [field]: value };
        setExam(prev => ({ ...prev, questions: newQuestions }));
    };

    const removeQuestion = (idx: number) => {
        const newQuestions = [...exam.questions];
        newQuestions.splice(idx, 1);
        setExam(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSave = async () => {
        if (!exam.id || !exam.title) {
            alert("ID and Title are required");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...exam,
                    createdAt: exam.createdAt || new Date().toISOString()
                })
            });
            if (res.ok) {
                alert("Exam saved!");
                router.push('/admin');
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown error";
            alert("Error: " + message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0f0f16] text-white p-6 pb-32">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-white mb-6">
                    <ArrowLeft size={18} className="mr-2" /> Back
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{isNew ? "Create Exam" : "Edit Exam"}</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        <Save size={18} /> {saving ? "Saving..." : "Save Exam"}
                    </button>
                </div>

                {/* Metadata */}
                <div className="bg-[#1e1e2e] p-6 rounded-lg border border-[#27273a] mb-8 grid grid-cols-2 gap-6">
                    <div className="col-span-1">
                        <label className="block text-gray-400 text-sm mb-1">Exam ID (URL Slug)</label>
                        <input
                            className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white font-mono"
                            value={exam.id}
                            onChange={e => setExam(prev => ({ ...prev, id: e.target.value }))}
                            disabled={!isNew}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-gray-400 text-sm mb-1">Title</label>
                        <input
                            className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white"
                            value={exam.title}
                            onChange={e => setExam(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-400 text-sm mb-1">Description</label>
                        <textarea
                            className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white h-20"
                            value={exam.description}
                            onChange={e => setExam(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-gray-400 text-sm mb-1">Duration (Matches)</label>
                        <input
                            type="number"
                            className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white"
                            value={exam.durationMinutes}
                            onChange={e => setExam(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                        />
                    </div>
                    <div className="col-span-1 flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer bg-[#161622] p-2 rounded border border-[#27273a] w-full">
                            <input
                                type="checkbox"
                                checked={exam.isPublic}
                                onChange={e => setExam(prev => ({ ...prev, isPublic: e.target.checked }))}
                                className="w-5 h-5 rounded bg-blue-500"
                            />
                            <span className="font-bold">Publicly Visible</span>
                        </label>
                    </div>
                </div>

                {/* Questions */}
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Questions ({exam.questions.length})</h2>
                    <button onClick={addQuestion} className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                        <Plus size={18} /> Add Question
                    </button>
                </div>

                <div className="space-y-6">
                    {exam.questions.map((q: Question, idx: number) => (
                        <div key={idx} className="bg-[#1e1e2e] rounded-lg border border-[#27273a] overflow-hidden">
                            <div className="bg-[#27273a] p-4 flex justify-between items-center">
                                <h3 className="font-bold text-gray-200">Question {idx + 1}</h3>
                                <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-300">
                                    <Trash size={18} />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="col-span-3">
                                        <label className="block text-xs text-gray-500 mb-1">Question Title</label>
                                        <input
                                            className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white"
                                            value={q.title}
                                            onChange={e => updateQuestion(idx, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Points</label>
                                        <input
                                            type="number"
                                            className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white"
                                            value={q.points}
                                            onChange={e => updateQuestion(idx, 'points', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Description / Problem Statement (Markdown)</label>
                                    <textarea
                                        className="w-full bg-[#161622] border border-[#27273a] p-2 rounded text-white h-24 font-mono text-sm"
                                        value={q.description}
                                        onChange={e => updateQuestion(idx, 'description', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-64 border border-[#27273a] rounded overflow-hidden flex flex-col">
                                        <div className="bg-[#161622] px-3 py-1 text-xs text-gray-500 border-b border-[#27273a]">Initial Code (Student sees this)</div>
                                        <div className="flex-1 relative">
                                            <CodeEditor
                                                initialValue={q.initialCode}
                                                onChange={v => updateQuestion(idx, 'initialCode', v || '')}
                                                language="python"
                                            />
                                        </div>
                                    </div>
                                    <div className="h-64 border border-[#27273a] rounded overflow-hidden flex flex-col">
                                        <div className="bg-[#161622] px-3 py-1 text-xs text-gray-500 border-b border-[#27273a]">Validation Code (Hidden assertion logic)</div>
                                        <div className="flex-1 relative">
                                            <CodeEditor
                                                initialValue={q.validationCode || ""}
                                                onChange={v => updateQuestion(idx, 'validationCode', v || '')}
                                                language="python"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
