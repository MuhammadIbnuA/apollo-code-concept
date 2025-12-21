'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Trophy } from 'lucide-react';
import { COURSES } from '@/data/courses';
import { useAppContext } from '@/context/AppContext';

export default function CoursesPage() {
    const { studentName, setStudentName } = useAppContext();
    const [inputName, setInputName] = useState('');
    const [showNamePrompt, setShowNamePrompt] = useState(true);

    useEffect(() => {
        if (studentName) {
            setShowNamePrompt(false);
            setInputName(studentName);
        }
    }, [studentName]);

    const handleSubmitName = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputName.trim()) {
            setStudentName(inputName.trim());
            setShowNamePrompt(false);
        }
    };

    // Name input prompt
    if (showNamePrompt) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🎓</div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Selamat Datang di Apollo Learning
                        </h1>
                        <p className="text-gray-300">
                            Platform belajar programming interaktif
                        </p>
                    </div>

                    <form onSubmit={handleSubmitName}>
                        <input
                            type="text"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            placeholder="Masukkan nama kamu..."
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!inputName.trim()}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Mulai Belajar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <header className="bg-black/20 backdrop-blur border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚀</span>
                        <span className="text-xl font-bold text-white">Apollo Learning</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">Halo, {studentName}!</span>
                        <Link
                            href="/exams"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        >
                            Take Exam
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Pilih Kursus
                    </h1>
                    <p className="text-xl text-gray-300">
                        Mulai perjalanan programming kamu dengan memilih kursus di bawah
                    </p>
                </div>
            </section>

            {/* Course Cards */}
            <section className="px-4 pb-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {COURSES.map((course) => (
                        <Link
                            key={course.id}
                            href={`/learn/${course.id}`}
                            className="group bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                        >
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-3xl mb-4`}>
                                {course.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {course.title}
                            </h3>
                            <p className="text-gray-400 mb-4">
                                {course.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <BookOpen size={14} />
                                    <span>{course.lessonCount || 5} Lessons</span>
                                </div>
                                <div className="flex items-center gap-1 text-purple-400 group-hover:text-purple-300 transition-colors">
                                    <span className="text-sm">Mulai</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-4 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
                        <div className="grid grid-cols-3 gap-8 text-center">
                            <div>
                                <BookOpen className="mx-auto text-purple-400 mb-2" size={32} />
                                <div className="text-3xl font-bold text-white">{COURSES.length}</div>
                                <div className="text-gray-400">Kursus</div>
                            </div>
                            <div>
                                <Users className="mx-auto text-blue-400 mb-2" size={32} />
                                <div className="text-3xl font-bold text-white">100+</div>
                                <div className="text-gray-400">Siswa</div>
                            </div>
                            <div>
                                <Trophy className="mx-auto text-yellow-400 mb-2" size={32} />
                                <div className="text-3xl font-bold text-white">20+</div>
                                <div className="text-gray-400">Lessons</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
