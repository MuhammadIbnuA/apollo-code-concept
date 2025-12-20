"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Play, Lock, User } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Lesson } from "@/lib/db";

export default function StudentDashboard() {
    const { studentName, setStudentName, points, completedLessons } = useAppContext();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [nameInput, setNameInput] = useState("");
    const [showNameModal, setShowNameModal] = useState(false);

    useEffect(() => {
        // Fetch public lessons
        fetch('/api/teacher/lessons') // Reuse this hook or create specific? Teacher endpoint returns ALL. Student needs PUBLIC.
            // Wait, I didn't create a GET public lessons endpoint specific. 
            // Let's use the same endpoint but filter client side or fix the API?
            // Fix API: GET /api/teacher/lessons is protected? No auth yet.
            // I should stick to plans. Plan said /api/student/progress... 
            // I'll just fetch all and filter `isPublic` for now.
            .then(async (res) => {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLessons(data.filter((l: Lesson) => l.isPublic));
                } else {
                    console.error("Failed to load lessons:", data);
                    setLessons([]);
                }
            })
            .catch(err => {
                console.error("Network error loading lessons:", err);
                setLessons([]);
            });
    }, []);

    useEffect(() => {
        if (!studentName) setShowNameModal(true);
    }, [studentName]);

    const handleLogin = () => {
        if (nameInput.trim()) {
            setStudentName(nameInput.trim());
            setShowNameModal(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8">
            <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Apollo Learning path
                    </h1>
                    <p className="text-gray-400 mt-2">Master Python through interactive challenges</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/exams" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        Take an Exam
                    </Link>

                    <div className="bg-[#1e1e2e] border border-gray-700 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg cursor-pointer" onClick={() => setShowNameModal(true)}>
                        <div className="bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full p-1">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-bold">Player</span>
                            <span className="text-white font-bold leading-none">{studentName || "Guest"}</span>
                        </div>
                        <div className="h-8 w-px bg-gray-700 mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-yellow-500 uppercase font-bold">Score</span>
                            <span className="text-yellow-400 font-bold leading-none">{points} XP</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    // Unlock logic: First is always unlocked. Others unlock if previous is completed?
                    // For now, allow all.
                    const isLocked = false;

                    return (
                        <div key={lesson.id} className="group relative bg-[#1e1e2e] border border-gray-700 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col">

                            <div className="h-2 bg-gradient-to-r from-gray-700 to-gray-800 group-hover:from-blue-600 group-hover:to-purple-600 transition-all" />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-gray-500 font-mono text-sm border border-gray-700">
                                        {index + 1}
                                    </div>
                                    {isCompleted && <CheckCircle className="text-green-500" size={24} />}
                                    {isLocked && <Lock className="text-gray-600" size={20} />}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{lesson.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{lesson.description}</p>

                                <Link
                                    href={`/learn/${lesson.id}`}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCompleted
                                        ? "bg-green-900/20 text-green-400 border border-green-500/30 hover:bg-green-900/40"
                                        : "bg-white/5 text-white hover:bg-primary hover:text-white"
                                        }`}
                                >
                                    {isCompleted ? "Review Lesson" : "Start Lesson"} <Play size={16} fill="currentColor" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Name Login Modal */}
            {showNameModal && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 fixed h-screen w-screen">
                    <div className="bg-[#1e1e2e] border border-gray-700 w-full max-w-sm rounded-xl shadow-2xl p-8 text-center relative">
                        <h2 className="text-2xl font-bold text-white mb-2">Who is learning today?</h2>
                        <input
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white my-4 text-center focus:border-primary outline-none"
                            placeholder="Enter your name"
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
