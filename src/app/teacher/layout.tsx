
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, BarChart2, LogOut } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-primary">
                        Teacher Mode
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/teacher" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/teacher/lessons" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <BookOpen size={20} /> Lesson Manager
                    </Link>
                    <Link href="/teacher/exams" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <BarChart2 size={20} /> Exam & Analytics
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <Link href="/learn" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <LogOut size={16} /> Exit to Student View
                    </Link>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 bg-background">
                {children}
            </main>
        </div>
    );
}
