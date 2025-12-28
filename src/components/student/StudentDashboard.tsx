"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Play, Lock, User } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Lesson } from "@/lib/types";

export default function StudentDashboard() {
    const { studentName, setStudentName, points, completedLessons } = useAppContext();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [nameInput, setNameInput] = useState("");
    const [showNameModal, setShowNameModal] = useState(false);

    useEffect(() => {
        fetch('/api/teacher/lessons')
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
            <header className="flex justify-between items-center mb-12 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        Apollo Learning Path
                    </h1>
                    <p className="text-muted-foreground mt-2">Master Python through interactive challenges</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/exams" className="bg-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-full font-bold text-sm transition-colors shadow-sm">
                        Take an Exam
                    </Link>

                    <div className="bg-card border border-border rounded-full px-4 py-2 flex items-center gap-3 shadow-sm cursor-pointer" onClick={() => setShowNameModal(true)}>
                        <div className="bg-primary rounded-full p-1">
                            <User size={16} className="text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase font-bold">Player</span>
                            <span className="text-foreground font-bold leading-none">{studentName || "Guest"}</span>
                        </div>
                        <div className="h-8 w-px bg-border mx-1"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-warning uppercase font-bold">Score</span>
                            <span className="text-warning font-bold leading-none">{points} XP</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLocked = false;

                    return (
                        <div key={lesson.id} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-md flex flex-col">

                            <div className="h-2 bg-muted group-hover:bg-primary transition-all" />

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-mono text-sm border border-border">
                                        {index + 1}
                                    </div>
                                    {isCompleted && <CheckCircle className="text-success" size={24} />}
                                    {isLocked && <Lock className="text-muted-foreground" size={20} />}
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{lesson.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{lesson.description}</p>

                                <Link
                                    href={`/learn/${lesson.id}`}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCompleted
                                        ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                                        : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
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
                <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 fixed h-screen w-screen">
                    <div className="bg-card border border-border w-full max-w-sm rounded-xl shadow-lg p-8 text-center relative">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Who is learning today?</h2>
                        <input
                            className="w-full bg-background border border-border rounded p-3 text-foreground my-4 text-center focus:border-primary outline-none"
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
