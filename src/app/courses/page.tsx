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
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border shadow-lg">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">🎓</div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Selamat Datang di Apollo Learning
                        </h1>
                        <p className="text-muted-foreground">
                            Platform belajar programming interaktif
                        </p>
                    </div>

                    <form onSubmit={handleSubmitName}>
                        <input
                            type="text"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            placeholder="Masukkan nama kamu..."
                            className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!inputName.trim()}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            Mulai Belajar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚀</span>
                        <span className="text-xl font-bold text-foreground">Apollo Learning</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">Halo, {studentName}!</span>
                        <Link
                            href="/exams"
                            className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-sm transition-colors shadow-sm"
                        >
                            Take Exam
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Pilih Kursus
                    </h1>
                    <p className="text-xl text-muted-foreground">
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
                            className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:scale-[1.02]"
                        >
                            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-3xl mb-4`}>
                                {course.icon}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                {course.title}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {course.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <BookOpen size={14} />
                                    <span>{course.lessonCount || 5} Lessons</span>
                                </div>
                                <div className="flex items-center gap-1 text-primary group-hover:opacity-80 transition-colors">
                                    <span className="text-sm font-medium">Mulai</span>
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
                    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                        <div className="grid grid-cols-3 gap-8 text-center">
                            <div>
                                <BookOpen className="mx-auto text-primary mb-2" size={32} />
                                <div className="text-3xl font-bold text-foreground">{COURSES.length}</div>
                                <div className="text-muted-foreground">Kursus</div>
                            </div>
                            <div>
                                <Users className="mx-auto text-success mb-2" size={32} />
                                <div className="text-3xl font-bold text-foreground">100+</div>
                                <div className="text-muted-foreground">Siswa</div>
                            </div>
                            <div>
                                <Trophy className="mx-auto text-warning mb-2" size={32} />
                                <div className="text-3xl font-bold text-foreground">20+</div>
                                <div className="text-muted-foreground">Lessons</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
