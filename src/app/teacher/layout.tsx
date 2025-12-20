
import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, BarChart2, LogOut } from 'lucide-react';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-[#0d0d15] text-white">
            <aside className="w-64 border-r border-gray-800 bg-[#16161e] flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                        Teacher Mode
                    </h2>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/teacher" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/teacher/lessons" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                        <BookOpen size={20} /> Lesson Manager
                    </Link>
                    <Link href="/teacher" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                        <BarChart2 size={20} /> Analytics
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Link href="/learn" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-white transition-colors">
                        <LogOut size={16} /> Exit to Student View
                    </Link>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
