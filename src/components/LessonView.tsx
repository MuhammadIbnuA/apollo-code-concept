"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Play, CheckCircle, AlertCircle, Menu, ChevronRight } from "lucide-react";
import CodeEditor from "@/components/Editor/CodeEditor";
import { runCode } from "@/lib/judge0";
import { Lesson, CURRICULUM } from "@/data/curriculum";
import { cn } from "@/lib/utils";

interface LessonViewProps {
    lesson: Lesson;
}

export default function LessonView({ lesson }: LessonViewProps) {
    const [code, setCode] = useState(lesson.initialCode);
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "wrong_answer" | "error">("idle");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Reset state when lesson changes
    useEffect(() => {
        setCode(lesson.initialCode);
        setOutput("");
        setStatus("idle");
    }, [lesson.id]);

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Running...");
        setStatus("idle");
        try {
            const result = await runCode(code);
            // Combine stdout and stderr so the user sees everything (prints + errors)
            let rawOutput = (result.stdout || "") + (result.stderr || "") + (result.compile_output || "");

            console.log("[LessonView] Raw Result:", result);

            if (!rawOutput) {
                rawOutput = "(No output generated)\n\nDebug Info:\n" + JSON.stringify(result, null, 2);
            }

            setOutput(rawOutput);

            // Simple validation logic
            if (lesson.expectedOutput) {
                if (rawOutput.trim() === lesson.expectedOutput.trim()) {
                    setStatus("success");
                } else {
                    setStatus("wrong_answer");
                }
            } else {
                // If no strict output, check if there was an error stream
                if (result.stderr) setStatus("error");
                else setStatus("success");
            }
        } catch (error: any) {
            console.error("Execution Error:", error);
            let errorMessage = error.message || "Unknown Error";
            // If it's an object with details (like our proxy returns), show that
            if (error.response?.data) {
                errorMessage += "\n" + JSON.stringify(error.response.data, null, 2);
            }
            setOutput("⚠️ Error:\n" + errorMessage + "\n\n(Check your terminal for server-side logs)");
            setStatus("error");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <div
                className={cn(
                    "flex-shrink-0 border-r border-border bg-black/20 transition-all duration-300",
                    isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
                )}
            >
                <div className="p-4 font-bold text-xl border-b border-border text-primary">
                    PyZero
                </div>
                <div className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
                    {CURRICULUM.map((l) => (
                        <Link
                            key={l.id}
                            href={`/learn/${l.id}`}
                            className={cn(
                                "block px-3 py-2 rounded-md text-sm transition-colors",
                                l.id === lesson.id
                                    ? "bg-primary/20 text-primary font-medium"
                                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                            )}
                        >
                            {l.title}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Header / Toggle */}
                <div className="h-12 border-b border-border flex items-center px-4 justify-between bg-black/10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="font-semibold text-gray-200">{lesson.title}</span>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isRunning ? "Running..." : <><Play size={16} /> Run Code</>}
                    </button>
                </div>

                {/* Split View: Content | Editor */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Markdown Content */}
                    <div className="flex-1 overflow-y-auto p-6 lg:w-1/2 prose prose-invert prose-headings:text-primary max-w-none">
                        <ReactMarkdown>{lesson.content}</ReactMarkdown>

                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h3 className="text-blue-400 font-bold mb-2">Task</h3>
                            <p className="text-gray-300">{lesson.task}</p>
                            {lesson.expectedOutput && (
                                <div className="mt-2 text-xs text-gray-500">
                                    Expected Output: <code className="bg-black/30 px-1 rounded">{JSON.stringify(lesson.expectedOutput)}</code>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor & Output Panel */}
                    <div className="flex-1 flex flex-col border-l border-border bg-[#1e1e2e] lg:w-1/2 min-h-[50vh] lg:min-h-auto">
                        <div className="flex-1 relative">
                            <CodeEditor
                                initialValue={code}
                                onChange={(val) => setCode(val || "")}
                            />
                        </div>

                        {/* Output Area */}
                        <div className="h-48 border-t border-border bg-black/30 flex flex-col">
                            <div className="px-4 py-2 border-b border-border text-xs font-bold text-gray-400 uppercase flex justify-between">
                                <span>Console Output</span>
                                {status === "success" && <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Correct</span>}
                                {status === "wrong_answer" && <span className="text-yellow-400 flex items-center gap-1"><AlertCircle size={12} /> Wrong Answer</span>}
                                {status === "error" && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> Execution Error</span>}
                            </div>
                            <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-gray-300">
                                {output || <span className="text-gray-600 italic">Hit run to see output...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
