"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Play, CheckCircle, AlertCircle, User, Menu } from "lucide-react";
import CodeEditor from "@/components/Editor/CodeEditor";
import { runCode } from "@/lib/judge0";
import { Lesson } from "@/lib/db"; // Use the shared Type from DB (or Client version)
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import Link from "next/link";

interface StudentWorkspaceProps {
    lesson: Lesson;
    allLessons?: Lesson[]; // For sidebar nav
}

export default function StudentWorkspace({ lesson, allLessons = [] }: StudentWorkspaceProps) {
    const {
        studentName,
        setStudentName,
        points,
        completedLessons,
        submitAttempt,
        refreshProgress
    } = useAppContext();

    const [code, setCode] = useState(lesson.initialCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "wrong_answer" | "error">("idle");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Login Modal State
    const [showNameModal, setShowNameModal] = useState(false);
    const [nameInput, setNameInput] = useState("");

    // Reset when lesson changes
    useEffect(() => {
        setCode(lesson.initialCode);
        setOutput("");
        setStatus("idle");
    }, [lesson.id, lesson.initialCode]);

    // Force login check
    useEffect(() => {
        if (!studentName) setShowNameModal(true);
    }, [studentName]);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Running...");
        setStatus("idle");

        try {
            // 1. Prepare Code (Hidden Validation Interceptor)
            let codeToRun = code;
            if (lesson.validationCode && lesson.validationType === 'code') {
                codeToRun += `\n\n${lesson.validationCode}`;
            }

            // 2. Execute
            const result = await runCode(codeToRun);
            let rawOutput = (result.stdout || "") + (result.stderr || "") + (result.compile_output || "");

            if (!rawOutput) rawOutput = "(No output generated)";

            // 3. Validate
            let newStatus: "success" | "wrong_answer" | "error" = "idle" as any;

            if (lesson.validationType === 'code') {
                // If custom code, stderr usually means assertion failed
                if (result.stderr) {
                    newStatus = "wrong_answer"; // Assume assertion error
                    if (!result.stderr.includes("AssertionError")) newStatus = "error"; // True runtime error
                } else {
                    newStatus = "success";
                }
            } else {
                // Stdout matching
                if (rawOutput.trim() === (lesson.expectedOutput || "").trim()) {
                    newStatus = "success";
                } else {
                    newStatus = result.stderr ? "error" : "wrong_answer";
                }
            }

            setOutput(rawOutput);
            setStatus(newStatus);

            // 4. Submit to Backend
            if (studentName) {
                await submitAttempt(lesson.id, newStatus, code);
                // Progress is auto-refreshed by context
            }

        } catch (error: any) {
            console.error(error);
            setOutput("⚠️ Execution Error:\n" + (error.message || "Unknown error"));
            setStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    const handleLogin = () => {
        if (nameInput.trim()) {
            setStudentName(nameInput.trim());
            setShowNameModal(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <div className={cn(
                "flex-shrink-0 border-r border-border bg-black/20 transition-all duration-300 flex flex-col",
                sidebarOpen ? "w-64" : "w-0 overflow-hidden"
            )}>
                <div className="p-4 font-bold text-xl border-b border-border text-primary">
                    PyZero
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {allLessons.map(l => (
                        <Link
                            key={l.id}
                            href={`/learn/${l.id}`}
                            className={cn(
                                "block px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
                                l.id === lesson.id ? "bg-primary/20 text-primary font-medium" : "hover:bg-white/5 text-gray-400"
                            )}
                        >
                            <span>{l.title}</span>
                            {completedLessons.includes(l.id) && <CheckCircle size={14} className="text-green-500" />}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-black/10 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-md">
                            <Menu size={20} />
                        </button>
                        <span className="font-semibold text-gray-200">{lesson.title}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Points Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full" onClick={() => setShowNameModal(true)}>
                            <User size={16} className="text-yellow-400" />
                            <span className="text-yellow-200 text-sm font-bold">{studentName || "Guest"} ({points} pts)</span>
                        </div>

                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-all"
                        >
                            {isRunning ? "Running..." : <><Play size={16} /> Run Code</>}
                        </button>
                    </div>
                </div>

                {/* Workspace Split */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Left: Instructions */}
                    <div className="flex-1 overflow-y-auto p-6 lg:w-1/2 prose prose-invert max-w-none">
                        <ReactMarkdown>{lesson.content}</ReactMarkdown>

                        <div className="mt-8 p-5 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><CheckCircle size={18} /> Task</h3>
                            <p className="text-gray-200 text-sm">{lesson.task}</p>
                        </div>
                    </div>

                    {/* Right: Editor & Output */}
                    <div className="flex-1 flex flex-col border-l border-border bg-[#1e1e2e] lg:w-1/2 shadow-2xl z-10">
                        <div className="flex-1 relative">
                            <CodeEditor initialValue={code} onChange={val => setCode(val || "")} />
                        </div>
                        <div className="h-48 border-t border-border bg-[#181825] flex flex-col">
                            <div className="px-4 py-2 border-b border-border text-xs font-bold text-gray-400 uppercase flex justify-between items-center bg-black/20">
                                <span>Terminal Output</span>
                                {status === 'success' && <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Correct</span>}
                                {status === 'wrong_answer' && <span className="text-yellow-400 flex items-center gap-1"><AlertCircle size={12} /> Incorrect</span>}
                                {status === 'error' && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Error</span>}
                            </div>
                            <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-gray-300">
                                {output || <span className="text-gray-600 italic opacity-50">Run code to see output...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            {showNameModal && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#1e1e2e] border border-gray-700 w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome to PyZero</h2>
                        <p className="text-gray-400 mb-6 text-sm">Enter your name to track your progress.</p>
                        <input
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white mb-4 text-center focus:border-primary outline-none"
                            placeholder="Your Name"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                        <button onClick={handleLogin} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-md">
                            Start Coding
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
