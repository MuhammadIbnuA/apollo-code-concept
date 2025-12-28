"use client";

import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Play, CheckCircle, AlertCircle, User } from "lucide-react";
import dynamic from "next/dynamic";
const CodeEditor = dynamic(() => import("@/components/Editor/CodeEditor"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-card">Loading Editor...</div>
});
import { runCode } from "@/lib/judge0";
import { Lesson } from "@/lib/types";
import { useAppContext } from "@/context/AppContext";

interface LessonViewProps {
    lesson: Lesson;
    isShared?: boolean;
}

export default function LessonView({ lesson, isShared = false }: LessonViewProps) {
    const {
        studentName,
        setStudentName,
        points,
        submitAttempt
    } = useAppContext();

    const [code, setCode] = useState(lesson.initialCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "wrong_answer" | "error">("idle");

    // Student Login Modal
    const [showNameModal, setShowNameModal] = useState(false);
    const [nameInput, setNameInput] = useState("");

    // Reset state when lesson changes
    useEffect(() => {
        setCode(lesson.initialCode);
        setOutput("");
        setStatus("idle");
    }, [lesson.id, lesson.initialCode]);

    // Check for student name in shared mode
    useEffect(() => {
        if (isShared && !studentName) {
            setShowNameModal(true);
        }
    }, [isShared, studentName]);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Running...");
        setStatus("idle");
        try {
            let codeToRun = code;
            if (lesson.validationCode && lesson.validationType === 'code') {
                codeToRun += "\n\n" + lesson.validationCode;
            }

            const result = await runCode(codeToRun);
            let rawOutput = (result.stdout || "") + (result.stderr || "") + (result.compile_output || "");

            if (!rawOutput) {
                rawOutput = "(No output generated)";
            }

            setOutput(rawOutput);

            let newStatus: "success" | "wrong_answer" | "error" = "error";

            if (lesson.validationType === 'code') {
                if (result.stderr) {
                    if (result.stderr.includes("AssertionError")) {
                        newStatus = "wrong_answer";
                        rawOutput += "\n\n[Test Failed] Your code did not pass the hidden constraints.";
                        setOutput(rawOutput);
                    } else {
                        newStatus = "error";
                    }
                } else {
                    newStatus = "success";
                }
            } else if (lesson.expectedOutput) {
                if (rawOutput.trim() === lesson.expectedOutput.trim()) {
                    newStatus = "success";
                } else {
                    newStatus = "wrong_answer";
                }
            } else {
                if (result.stderr) newStatus = "error";
                else newStatus = "success";
            }

            setStatus(newStatus);

            if (studentName) {
                const apiStatus = newStatus === 'wrong_answer' ? 'failure' : newStatus;
                await submitAttempt(lesson.id, apiStatus, code);
            }

        } catch (error: unknown) {
            console.error("Execution Error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown Error";
            setOutput("⚠️ Error:\n" + errorMessage);
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
            {/* Main Layout */}
            <div className="flex flex-1 flex-col min-w-0 relative">
                {/* Header */}
                <div className="h-14 border-b border-border flex items-center px-4 justify-between bg-card shadow-sm">
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{lesson.title}</span>
                        {isShared && <span className="text-xs text-primary">Shared Lesson</span>}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/20 rounded-full cursor-pointer" onClick={() => setShowNameModal(true)}>
                            {studentName ? (
                                <>
                                    <User size={16} className="text-warning" />
                                    <span className="text-warning text-sm font-bold">{studentName} ({points} pts)</span>
                                </>
                            ) : (
                                <span className="text-xs text-warning hover:underline">Click to Login</span>
                            )}
                        </div>

                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-1.5 bg-success hover:opacity-90 text-success-foreground rounded-md text-sm font-medium transition-all disabled:opacity-50"
                        >
                            {isRunning ? "Running..." : <><Play size={16} /> Run Code</>}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Lesson Content */}
                    <div className="flex-1 overflow-y-auto p-6 lg:w-1/2 prose prose-neutral prose-headings:text-primary max-w-none bg-background">
                        <div className="lesson-content text-foreground">
                            <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </div>

                        <div className="mt-8 p-5 bg-primary/10 border border-primary/20 rounded-xl shadow-sm">
                            <h3 className="text-primary font-bold mb-2 flex items-center gap-2"><CheckCircle size={18} /> Your Task</h3>
                            <p className="text-foreground leading-relaxed text-sm">{lesson.task}</p>
                        </div>
                    </div>

                    {/* Editor & Output Panel */}
                    <div className="flex-1 flex flex-col border-l border-border bg-card lg:w-1/2 min-h-[50vh] lg:min-h-auto shadow-lg z-10">
                        <div className="flex-1 relative">
                            <CodeEditor
                                initialValue={code}
                                onChange={(val) => setCode(val || "")}
                            />
                        </div>

                        {/* Output Area */}
                        <div className="h-48 border-t border-border bg-muted flex flex-col">
                            <div className="px-4 py-2 border-b border-border text-xs font-bold text-muted-foreground uppercase flex justify-between items-center bg-card">
                                <span className="flex items-center gap-2">Terminal</span>
                                <div className="flex text-xs">
                                    {status === "success" && <span className="bg-success/20 text-success px-2 py-0.5 rounded flex items-center gap-1 border border-success/30"><CheckCircle size={12} /> Correct</span>}
                                    {status === "wrong_answer" && <span className="bg-warning/20 text-warning px-2 py-0.5 rounded flex items-center gap-1 border border-warning/30"><AlertCircle size={12} /> Wrong Answer</span>}
                                    {status === "error" && <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1 border border-destructive/30"><AlertCircle size={12} /> Execution Error</span>}
                                </div>
                            </div>
                            <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-foreground selection:bg-primary/20">
                                {output || <span className="text-muted-foreground italic opacity-50">Result will appear here...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Login Modal */}
            {showNameModal && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 fixed h-screen w-screen" onClick={() => !isShared && setShowNameModal(false)}>
                    <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-foreground mb-2">Enter Your Name</h2>
                        <p className="text-muted-foreground text-sm mb-4">Track your progress on this lesson.</p>
                        <input
                            className="w-full bg-background border border-border rounded p-3 text-foreground mb-4 text-center focus:border-primary outline-none"
                            placeholder="Your Name"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                        <button onClick={handleLogin} disabled={!nameInput.trim()} className="w-full py-2 bg-primary text-primary-foreground font-bold rounded-md disabled:opacity-50">
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
