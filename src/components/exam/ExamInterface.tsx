"use client";

import React, { useState, useEffect } from "react";
import { Exam, Question } from "@/data/exams";
import dynamic from "next/dynamic";
import { Play, CheckCircle, Clock, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { runCode } from "@/lib/judge0";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";

// Reuse the SSR-safe Editor Wrapper? Or just dynamic import here. 
// Let's use dynamic import here to be safe and explicit.
const CodeEditor = dynamic(() => import("@/components/Editor/CodeEditor"), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center text-gray-500 bg-[#1e1e2e]">Loading Editor...</div>
});

interface ExamInterfaceProps {
    exam: Exam;
}

export default function ExamInterface({ exam }: ExamInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [outputs, setOutputs] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);

    // Exam Submisison State
    const { studentName, setStudentName } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showNameModal, setShowNameModal] = useState(false);
    const [nameInput, setNameInput] = useState("");

    const currentQuestion = exam.questions[currentQuestionIndex];
    const currentCode = answers[currentQuestion.id] || currentQuestion.initialCode;
    const currentOutput = outputs[currentQuestion.id] || "";

    // Initialize answers
    useEffect(() => {
        const initialAnswers: Record<string, string> = {};
        exam.questions.forEach(q => {
            initialAnswers[q.id] = q.initialCode;
        });
        setAnswers(initialAnswers);
    }, [exam]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = (val: string | undefined) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: val || "" }));
    };

    const handleRun = async () => {
        setIsRunning(true);
        // Optimistic UI for output?
        setOutputs(prev => ({ ...prev, [currentQuestion.id]: "Running..." }));

        try {
            // Append validation code if it exists to check correctness
            const validationSuffix = currentQuestion.validationCode ? `\n\n${currentQuestion.validationCode}` : "";
            const codeToRun = currentCode + validationSuffix;

            const result = await runCode(codeToRun);
            const output = (result.stdout || "") + (result.stderr || "");

            // Check for success (no errors) logic
            let statusMessage = "";
            if (currentQuestion.validationCode) {
                if (result.stderr) {
                    statusMessage = "\n\n❌ Test Failed: " + (result.stderr.split("AssertionError:")[1]?.trim() || "Check your logic.");
                } else {
                    statusMessage = "\n\n✅ Correct! All tests passed.";
                }
            }

            setOutputs(prev => ({ ...prev, [currentQuestion.id]: output + statusMessage || "(No output)" }));
        } catch (e: any) {
            setOutputs(prev => ({ ...prev, [currentQuestion.id]: "Error: " + e.message }));
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!studentName) {
            setShowNameModal(true);
            return;
        }

        if (!confirm("Are you sure you want to submit your exam? This cannot be undone.")) return;

        setIsSubmitting(true);
        let calculatedScore = 0;
        let examTotal = 0;

        // Auto-scoring: Run validation for ALL questions
        for (const q of exam.questions) {
            examTotal += q.points;
            const code = answers[q.id] || q.initialCode;
            const contextCode = code + "\n\n" + (q.validationCode || "");

            try {
                const result = await runCode(contextCode);
                // Simple grading: If no stderr (error), give full points
                // In real world, we'd parse output more carefully or have specific PASS output
                if (!result.stderr) {
                    calculatedScore += q.points;
                }
            } catch (e) {
                // Failed execution = 0 points for this question
                console.error(`Error grading Q${q.id}`, e);
            }
        }

        setFinalScore(calculatedScore);
        setTotalPoints(examTotal);

        try {
            await fetch('/api/exam/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: exam.id,
                    studentName,
                    score: calculatedScore,
                    answers,
                    timeTakenSeconds: (exam.durationMinutes * 60) - timeLeft
                })
            });
            setShowResults(true);
        } catch (e: any) {
            alert("Failed to submit exam: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = () => {
        if (nameInput.trim()) {
            setStudentName(nameInput.trim());
            setShowNameModal(false);
            // Resume submission if this was triggered by submit
            // We can't auto-resume easily due to async, but user can click submit again
        }
    };

    if (showResults) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#0f0f16] text-white">
                <div className="bg-[#1e1e2e] p-8 rounded-xl border border-[#27273a] text-center max-w-md w-full">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Exam Submitted!</h2>
                    <p className="text-gray-400 mb-6">Thank you, {studentName}.</p>

                    <div className="bg-[#161622] p-6 rounded-lg mb-6 border border-[#27273a]">
                        <div className="text-sm text-gray-500 uppercase font-bold mb-1">Your Score</div>
                        <div className="text-5xl font-bold text-blue-400">
                            {finalScore} <span className="text-xl text-gray-600">/ {totalPoints}</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-6">
                        Your results have been recorded. You may close this tab returning to the dashboard.
                    </p>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#0f0f16] text-white font-sans overflow-hidden">
            {/* Sidebar Navigation (Questions) */}
            <div className="w-64 border-r border-[#27273a] bg-[#161622] flex flex-col">
                <div className="p-4 border-b border-[#27273a]">
                    <h2 className="font-bold text-lg text-blue-400">{exam.title}</h2>
                    <div className="mt-2 flex items-center gap-2 text-xl font-mono text-yellow-500 bg-yellow-500/10 p-2 rounded justify-center border border-yellow-500/20">
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {exam.questions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={cn(
                                "w-full text-left px-3 py-3 rounded-md text-sm transition-all flex items-center justify-between",
                                idx === currentQuestionIndex
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-400 hover:bg-[#27273a]"
                            )}
                        >
                            <span className="truncate">Q{idx + 1}: {q.title}</span>
                            {outputs[q.id] && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-[#27273a]">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : <><Save size={18} /> Submit Exam</>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 border-b border-[#27273a] bg-[#161622] flex items-center justify-between px-6">
                    <h3 className="font-bold text-gray-200">Question {currentQuestionIndex + 1} of {exam.questions.length}</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="p-2 bg-[#27273a] hover:bg-[#32324a] rounded disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentQuestionIndex(Math.min(exam.questions.length - 1, currentQuestionIndex + 1))}
                            disabled={currentQuestionIndex === exam.questions.length - 1}
                            className="p-2 bg-[#27273a] hover:bg-[#32324a] rounded disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                    {/* Problem Description */}
                    <div className="flex-1 lg:w-[40%] overflow-y-auto p-6 border-r border-[#27273a]">
                        <div className="prose prose-invert max-w-none">
                            <h1 className="text-2xl font-bold mb-4 text-white">{currentQuestion.title}</h1>
                            <div className="bg-[#1e1e2e] p-4 rounded-lg border border-[#27273a] mb-6">
                                <p className="text-gray-300 whitespace-pre-wrap">{currentQuestion.description}</p>
                            </div>

                            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg">
                                <h4 className="text-blue-400 font-bold text-sm uppercase mb-2">Points</h4>
                                <span className="text-2xl font-bold text-white">{currentQuestion.points}</span>
                            </div>
                        </div>
                    </div>

                    {/* Editor & Terminal */}
                    <div className="flex-1 lg:w-[60%] flex flex-col bg-[#0f0f16]">
                        {/* Editor Toolbar */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#161622] border-b border-[#27273a]">
                            <span className="text-xs font-mono text-gray-500">main.py</span>
                            <button
                                onClick={handleRun}
                                disabled={isRunning}
                                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all"
                            >
                                {isRunning ? "Running..." : <><Play size={14} /> Run Code</>}
                            </button>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 relative">
                            <CodeEditor
                                key={currentQuestion.id}
                                initialValue={currentCode}
                                onChange={handleCodeChange}
                                language="python"
                                theme="vs-dark"
                            />
                        </div>

                        {/* Terminal */}
                        <div className="h-48 border-t border-[#27273a] bg-[#0c0c12] flex flex-col">
                            <div className="px-4 py-2 border-b border-[#27273a] bg-[#161622] flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">Console Output</span>
                            </div>
                            <div className="flex-1 p-4 font-mono text-sm overflow-auto text-gray-300">
                                {currentOutput ? (
                                    <pre className="whitespace-pre-wrap">{currentOutput}</pre>
                                ) : (
                                    <span className="text-gray-600 italic">Run your code to see output...</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Name Modal */}
            {showNameModal && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#1e1e2e] border border-gray-700 w-full max-w-sm rounded-xl shadow-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Identify Yourself</h2>
                        <p className="text-gray-400 mb-6 text-sm">Please enter your name to submit the exam.</p>
                        <input
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white mb-4 text-center focus:border-blue-500 outline-none"
                            placeholder="Your Name"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                        <button onClick={handleLogin} className="w-full py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-500">
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
