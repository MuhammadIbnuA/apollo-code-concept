"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AppContextType {
    studentName: string;
    setStudentName: (name: string) => void;
    points: number;
    completedLessons: string[];
    refreshProgress: () => Promise<void>;
    submitAttempt: (lessonId: string, status: 'success' | 'failure' | 'error', code: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [studentName, setStudentName] = useState("");
    const [points, setPoints] = useState(0);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Load Name on Mount
    useEffect(() => {
        const savedName = localStorage.getItem("apollo_student_name");
        if (savedName) {
            setStudentName(savedName);
        }
        setIsInitialized(true);
    }, []);

    // 3. Fetch Progress (Points & Completions)
    const refreshProgress = useCallback(async () => {
        if (!studentName) return;
        try {
            const res = await fetch(`/api/student/progress?name=${encodeURIComponent(studentName)}`);
            const data = await res.json();
            if (data.points !== undefined) setPoints(data.points);
            if (data.completedLessons) setCompletedLessons(data.completedLessons);
        } catch (e) {
            console.error("Failed to refresh progress:", e);
        }
    }, [studentName]);

    // 2. Persist Name
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("apollo_student_name", studentName);
            if (studentName) refreshProgress();
        }
    }, [studentName, isInitialized, refreshProgress]);

    // 4. Submit Attempt
    const submitAttempt = async (lessonId: string, status: 'success' | 'failure' | 'error', code: string) => {
        if (!studentName) return;
        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, studentName, status, code })
            });
            const data = await res.json();

            // Optimistic update or use server response
            if (data.points !== undefined) {
                setPoints(data.points);
                if (status === 'success') {
                    setCompletedLessons(prev => Array.from(new Set([...prev, lessonId])));
                }
            }
        } catch (e) {
            console.error("Failed to submit attempt:", e);
        }
    };

    return (
        <AppContext.Provider
            value={{
                studentName,
                setStudentName,
                points,
                completedLessons,
                refreshProgress,
                submitAttempt
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
