'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import { COURSES, getLessonsByCourse, getCourseById } from '@/data/courses';
import { useAppContext } from '@/context/AppContext';
import type { Lesson } from '@/lib/types';
import { db } from '@/lib/db';

interface PageProps {
    params: Promise<{ courseId: string }>;
}

export default function CourseLessonsPage({ params }: PageProps) {
    const { courseId } = use(params);
    const { studentName } = useAppContext();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const course = getCourseById(courseId);

    useEffect(() => {
        async function loadLessons() {
            setLoading(true);

            // Get sample lessons for HTML/CSS/JS courses
            const sampleLessons = getLessonsByCourse(courseId);

            if (sampleLessons.length > 0) {
                setLessons(sampleLessons);
            } else if (courseId === 'python') {
                // Load Python lessons from database
                try {
                    const res = await fetch('/api/teacher/lessons');
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setLessons(data.filter((l: Lesson) => l.isPublic));
                    }
                } catch (e) {
                    console.error('Failed to load lessons:', e);
                }
            }

            setLoading(false);
        }

        loadLessons();
    }, [courseId]);

    // Load completed lessons for this student
    useEffect(() => {
        if (studentName) {
            fetch(`/api/student/progress?name=${encodeURIComponent(studentName)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.completedLessonIds) {
                        setCompletedLessons(data.completedLessonIds);
                    }
                })
                .catch(console.error);
        }
    }, [studentName]);

    if (!course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Kursus tidak ditemukan</h1>
                    <Link href="/courses" className="text-purple-400 hover:text-purple-300">
                        ← Kembali ke daftar kursus
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Kembali ke Kursus</span>
                    </Link>
                </div>
            </header>

            {/* Course Header */}
            <section className="py-12 px-4 border-b border-white/10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center text-4xl`}>
                            {course.icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {course.title}
                            </h1>
                            <p className="text-gray-400">
                                {course.description}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Progress Bar */}
            <section className="py-6 px-4 border-b border-white/10">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">
                            {completedLessons.filter(id => lessons.some(l => l.id === id)).length} / {lessons.length} lessons
                        </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${course.color} transition-all duration-500`}
                            style={{
                                width: lessons.length > 0
                                    ? `${(completedLessons.filter(id => lessons.some(l => l.id === id)).length / lessons.length) * 100}%`
                                    : '0%'
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* Lessons List */}
            <section className="py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="text-center text-gray-400 py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                            Loading lessons...
                        </div>
                    ) : lessons.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Belum ada lesson untuk kursus ini</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lessons.map((lesson, index) => {
                                const isCompleted = completedLessons.includes(lesson.id);
                                const isLocked = false; // All lessons unlocked for now

                                return (
                                    <Link
                                        key={lesson.id}
                                        href={isLocked ? '#' : `/learn/${courseId}/${lesson.id}`}
                                        className={`block bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 transition-all duration-300 ${isLocked
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Lesson Number */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${isCompleted
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : isLocked
                                                        ? 'bg-gray-500/20 text-gray-400'
                                                        : `bg-gradient-to-br ${course.color} text-white`
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle size={24} />
                                                ) : isLocked ? (
                                                    <Lock size={20} />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>

                                            {/* Lesson Info */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {lesson.title}
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    {lesson.description}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            {!isLocked && (
                                                <ArrowRight
                                                    size={20}
                                                    className="text-gray-400 group-hover:text-white transition-colors"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
