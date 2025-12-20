"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Play, CheckCircle, AlertCircle, Menu, Edit2, Save, X, BarChart2, User, GraduationCap, Share2, Copy } from "lucide-react";
import CodeEditor from "@/components/Editor/CodeEditor";
import { runCode } from "@/lib/judge0";
import { Lesson } from "@/data/curriculum";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";

interface LessonViewProps {
    lesson: Lesson;
    isShared?: boolean;
}

export default function LessonView({ lesson: initialLesson, isShared = false }: LessonViewProps) {
    const {
        lessons,
        updateLesson,
        isTeacherMode,
        toggleTeacherMode,
        points,
        markTaskComplete,
        studentName,
        setStudentName,
        saveSharedLesson,
        submitResult
    } = useAppContext();

    // In shared mode, we don't look up from global lessons state, we use the prop
    const currentLesson: any = isShared ? initialLesson : (lessons.find((l) => l.id === initialLesson.id) || initialLesson);

    const [code, setCode] = useState(currentLesson.initialCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "wrong_answer" | "error">("idle");
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isShared);

    // Teacher Mode - Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});

    // Analytics Modal State
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<any[]>([]);

    // Share Modal State
    const [shareUrl, setShareUrl] = useState("");

    // Student Login Modal
    const [showNameModal, setShowNameModal] = useState(false);
    const [nameInput, setNameInput] = useState("");

    // Reset state when lesson changes
    useEffect(() => {
        setCode(currentLesson.initialCode);
        setOutput("");
        setStatus("idle");
        setIsEditing(false);
    }, [currentLesson.id, currentLesson.initialCode]);

    // Check for student name
    useEffect(() => {
        if (!isTeacherMode && !studentName && !isShared) { // Only force modal if shared? Or always?
            // Maybe optional for default lessons, mandatory for shared
        }
        if (isShared && !studentName) {
            setShowNameModal(true);
        }
    }, [isShared, studentName, isTeacherMode]);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Running...");
        setStatus("idle");
        try {
            // Append validation code if exists (Advanced Validation)
            let codeToRun = code;
            if (currentLesson.validationCode && currentLesson.validationType === 'code') {
                codeToRun += "\n\n" + currentLesson.validationCode;
            }

            const result = await runCode(codeToRun);
            let rawOutput = (result.stdout || "") + (result.stderr || "") + (result.compile_output || "");

            if (!rawOutput) {
                rawOutput = "(No output generated)\n\nDebug Info:\n" + JSON.stringify(result, null, 2);
            }

            setOutput(rawOutput);

            let newStatus: "success" | "wrong_answer" | "error" = "idle" as any;

            if (currentLesson.validationType === 'code') {
                // If using custom validation code, success is NO stderr
                if (result.stderr) {
                    newStatus = "wrong_answer"; // Or error?
                    // If stderr contains specific assertion error
                    if (result.stderr.includes("AssertionError")) {
                        newStatus = "wrong_answer";
                        rawOutput += "\n\n[Test Failed] Your code did not pass the hidden constraints.";
                        setOutput(rawOutput); // Update output to show hint
                    } else {
                        newStatus = "error";
                    }
                } else {
                    newStatus = "success";
                }
            } else if (currentLesson.expectedOutput) {
                if (rawOutput.trim() === currentLesson.expectedOutput.trim()) {
                    newStatus = "success";
                } else {
                    newStatus = "wrong_answer";
                }
            } else {
                if (result.stderr) newStatus = "error";
                else newStatus = "success";
            }

            setStatus(newStatus);

            // Submit Result
            if (studentName) {
                submitResult(currentLesson.id, newStatus, code);
            }

            if (newStatus === "success" && !isTeacherMode) {
                markTaskComplete(currentLesson.id);
            }

        } catch (error: any) {
            console.error("Execution Error:", error);
            let errorMessage = error.message || "Unknown Error";
            setOutput("⚠️ Error:\n" + errorMessage);
            setStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    const startEditing = () => {
        setEditForm({
            ...currentLesson,
            validationType: currentLesson.validationType || 'output'
        });
        setIsEditing(true);
    };

    const saveEdits = () => {
        updateLesson(currentLesson.id, editForm);
        setIsEditing(false);
    };

    const handleShare = async () => {
        const id = await saveSharedLesson(editForm.id ? editForm : currentLesson); // Use editForm if currently editing? No, use currentLesson unless saved.
        // If we are int 'Edit Mode', user might want to share the DRAFT. 
        // Let's assume user saves first.
        if (id) {
            setShareUrl(`${window.location.origin}/share/${id}`);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics');
            const data = await res.json();
            if (Array.isArray(data)) {
                setAnalyticsData(data);
            } else {
                console.error("Analytics response is not an array:", data);
                setAnalyticsData([]);
            }
        } catch (e) {
            console.error("Failed to fetch analytics:", e);
            setAnalyticsData([]);
        }
    };

    useEffect(() => {
        if (showAnalytics) {
            fetchAnalytics();
        }
    }, [showAnalytics]);

    const handleLogin = () => {
        if (nameInput.trim()) {
            setStudentName(nameInput.trim());
            setShowNameModal(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar (Hide in Shared Mode unless we add a 'Home' button) */}
            {!isShared && (
                <div
                    className={cn(
                        "flex-shrink-0 border-r border-border bg-black/20 transition-all duration-300",
                        isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
                    )}
                >
                    <div className="p-4 font-bold text-xl border-b border-border text-primary flex items-center gap-2">
                        <span className="text-blue-400">PyZero</span>
                        {isTeacherMode && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40">Teacher</span>}
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
                        {lessons.map((l) => (
                            <Link
                                key={l.id}
                                href={`/learn/${l.id}`}
                                className={cn(
                                    "block px-3 py-2 rounded-md text-sm transition-colors",
                                    l.id === currentLesson.id
                                        ? "bg-primary/20 text-primary font-medium"
                                        : "hover:bg-white/5 text-gray-400 hover:text-white"
                                )}
                            >
                                {l.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex flex-1 flex-col min-w-0 relative">
                {/* Header */}
                <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-black/10 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        {!isShared && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                        )}

                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-200">{currentLesson.title}</span>
                            {isTeacherMode && <span className="text-xs text-red-400">Edit Mode Available</span>}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Student Info */}
                        {!isTeacherMode && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full cursor-pointer" onClick={() => setShowNameModal(true)}>
                                {studentName ? (
                                    <>
                                        <User size={16} className="text-yellow-400" />
                                        <span className="text-yellow-200 text-sm font-bold">{studentName} ({points} pts)</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-yellow-500 hover:underline">Click to Login</span>
                                )}
                            </div>
                        )}

                        {/* Teacher Mode Toggle (Disable in Shared Mode View?) */}
                        {!isShared && (
                            <div className="flex items-center bg-gray-800 rounded-full p-1 border border-gray-700">
                                <button
                                    onClick={() => isTeacherMode && toggleTeacherMode()}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                        !isTeacherMode ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Student
                                </button>
                                <button
                                    onClick={() => !isTeacherMode && toggleTeacherMode()}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-medium transition-all",
                                        isTeacherMode ? "bg-red-600 text-white shadow-md" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    Teacher
                                </button>
                            </div>
                        )}

                        {isTeacherMode && (
                            <button
                                onClick={() => setShowAnalytics(true)}
                                className="p-2 hover:bg-white/10 rounded-md text-gray-300 hover:text-white"
                                title="Analytics"
                            >
                                <BarChart2 size={20} />
                            </button>
                        )}

                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none"
                        >
                            {isRunning ? "Running..." : <><Play size={16} /> Run Code</>}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Lesson Content / Edit Form */}
                    <div className="flex-1 overflow-y-auto p-6 lg:w-1/2 prose prose-invert prose-headings:text-primary max-w-none custom-scrollbar">

                        {isTeacherMode && isEditing ? (
                            <div className="space-y-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white m-0">Edit Task Configuration</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-md"><X size={18} /></button>
                                        <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-500"><Share2 size={16} /> Create Link</button>
                                        <button onClick={saveEdits} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"><Save size={16} /> Save Local</button>
                                    </div>
                                </div>

                                {shareUrl && (
                                    <div className="mb-4 p-3 bg-green-900/40 border border-green-500/50 rounded flex items-center justify-between">
                                        <code className="text-xs text-green-300 truncate mr-2">{shareUrl}</code>
                                        <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="text-green-400 hover:text-white"><Copy size={16} /></button>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold">Lesson Title</label>
                                    <input
                                        className="w-full bg-black/40 border border-gray-700 rounded p-2 text-white"
                                        value={editForm.title || ""}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase text-gray-500 font-bold block mb-1">Validation Type</label>
                                        <select
                                            className="w-full bg-black/40 border border-gray-700 rounded p-2 text-white text-sm"
                                            value={editForm.validationType || 'output'}
                                            onChange={e => setEditForm({ ...editForm, validationType: e.target.value })}
                                        >
                                            <option value="output">Exact Output Match</option>
                                            <option value="code">Hidden Test Code</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold">Content (Markdown)</label>
                                    <textarea
                                        className="w-full h-40 bg-black/40 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                        value={editForm.content || ""}
                                        onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs uppercase text-gray-500 font-bold">Task Description</label>
                                    <textarea
                                        className="w-full h-24 bg-black/40 border border-gray-700 rounded p-2 text-white"
                                        value={editForm.task || ""}
                                        onChange={e => setEditForm({ ...editForm, task: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase text-gray-500 font-bold">Initial Code</label>
                                        <textarea
                                            className="w-full h-32 bg-black/40 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                            value={editForm.initialCode || ""}
                                            onChange={e => setEditForm({ ...editForm, initialCode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        {editForm.validationType === 'code' ? (
                                            <>
                                                <label className="text-xs uppercase text-gray-500 font-bold text-purple-400">Hidden Validation Code</label>
                                                <textarea
                                                    className="w-full h-32 bg-purple-900/20 border border-purple-500/50 rounded p-2 text-white font-mono text-xs"
                                                    placeholder="Use 'assert' to check variables. Ex: assert x == 10"
                                                    value={editForm.validationCode || ""}
                                                    onChange={e => setEditForm({ ...editForm, validationCode: e.target.value })}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <label className="text-xs uppercase text-gray-500 font-bold">Expected Output</label>
                                                <textarea
                                                    className="w-full h-32 bg-black/40 border border-gray-700 rounded p-2 text-white font-mono text-xs"
                                                    value={editForm.expectedOutput || ""}
                                                    onChange={e => setEditForm({ ...editForm, expectedOutput: e.target.value })}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                {isTeacherMode && !isShared && (
                                    <div className="mb-4 flex justify-end">
                                        <button
                                            onClick={startEditing}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-md text-xs transition-colors"
                                        >
                                            <Edit2 size={14} /> Edit / Share
                                        </button>
                                    </div>
                                )}

                                <div className="lesson-content">
                                    <ReactMarkdown>{currentLesson.content}</ReactMarkdown>
                                </div>

                                <div className="mt-8 p-5 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/20 rounded-xl shadow-lg relative overflow-hidden group">
                                    <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><CheckCircle size={18} /> Your Task</h3>
                                    <p className="text-gray-200 leading-relaxed text-sm">{currentLesson.task}</p>
                                    {isTeacherMode && (
                                        <div className="mt-4">
                                            {currentLesson.validationType === 'code' ? (
                                                <div className="p-2 bg-purple-900/30 rounded border border-purple-500/30">
                                                    <p className="text-xs text-purple-300 uppercase font-bold mb-1">Validation: Hidden Code (Visible to Teacher)</p>
                                                    <code className="text-xs font-mono text-gray-300 block whitespace-pre">{currentLesson.validationCode}</code>
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-black/40 rounded border border-white/5">
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Expected Output (Visible to Teacher)</p>
                                                    <code className="text-xs font-mono text-green-300 block whitespace-pre">{currentLesson.expectedOutput}</code>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Editor & Output Panel */}
                    <div className="flex-1 flex flex-col border-l border-border bg-[#1e1e2e] lg:w-1/2 min-h-[50vh] lg:min-h-auto shadow-2xl z-10">
                        <div className="flex-1 relative">
                            <CodeEditor
                                initialValue={code}
                                onChange={(val) => setCode(val || "")}
                            />
                        </div>

                        {/* Output Area */}
                        <div className="h-48 border-t border-border bg-[#181825] flex flex-col">
                            <div className="px-4 py-2 border-b border-border text-xs font-bold text-gray-400 uppercase flex justify-between items-center bg-black/20">
                                <span className="flex items-center gap-2">Terminal</span>
                                <div className="flex text-xs">
                                    {status === "success" && <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1 border border-green-500/30"><CheckCircle size={12} /> Correct</span>}
                                    {status === "wrong_answer" && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded flex items-center gap-1 border border-yellow-500/30"><AlertCircle size={12} /> Wrong Answer</span>}
                                    {status === "error" && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1 border border-red-500/30"><AlertCircle size={12} /> Execution Error</span>}
                                </div>
                            </div>
                            <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-gray-300 selection:bg-white/20">
                                {output || <span className="text-gray-600 italic opacity-50">Result will appear here...</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Modal Overlay */}
                {showAnalytics && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAnalytics(false)}>
                        <div className="bg-[#1e1e2e] border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BarChart2 className="text-blue-500" /> Class Analytics</h2>
                                <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-white">{analyticsData.length}</div>
                                    <div className="text-xs text-blue-300 uppercase font-bold mt-1">Total Submissions</div>
                                </div>
                                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                                    <div className="text-3xl font-bold text-white">{analyticsData.filter(d => d.status === 'success').length}</div>
                                    <div className="text-xs text-green-300 uppercase font-bold mt-1">Success Count</div>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-gray-700">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-black/40 text-gray-400 uppercase text-xs font-bold">
                                        <tr>
                                            <th className="p-4">Student</th>
                                            <th className="p-4">Lesson ID</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {analyticsData.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500 italic">No data available yet.</td>
                                            </tr>
                                        )}
                                        {analyticsData.map((d, i) => (
                                            <tr key={i} className="hover:bg-white/5">
                                                <td className="p-4 text-gray-300 font-bold">{d.studentName}</td>
                                                <td className="p-4 text-gray-400 font-mono text-xs">{d.lessonId.substring(0, 8)}...</td>
                                                <td className="p-4">
                                                    {d.status === 'success' && <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Success</span>}
                                                    {d.status !== 'success' && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {d.status}</span>}
                                                </td>
                                                <td className="p-4 text-right text-gray-500 text-xs">
                                                    {new Date(d.timestamp).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Name Login Modal */}
                {showNameModal && (
                    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-[#1e1e2e] border border-gray-700 w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
                            <p className="text-gray-400 mb-6 text-sm">Please enter your name to start earning points.</p>
                            <input
                                className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white mb-4 text-center focus:border-primary outline-none transition-colors"
                                placeholder="Your Name"
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            />
                            <button
                                onClick={handleLogin}
                                className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-md transition-colors"
                            >
                                Start Learning
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
