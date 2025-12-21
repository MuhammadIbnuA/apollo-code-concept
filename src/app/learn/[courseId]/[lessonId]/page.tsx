'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Play, RotateCcw, ChevronDown, ChevronUp, Code, Eye, FileText } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { getCourseById, getLessonsByCourse, getLanguageConfig } from '@/data/courses';
import { useAppContext } from '@/context/AppContext';
import HtmlPreview from '@/components/Editor/HtmlPreview';
import type { Lesson, CourseLanguage } from '@/lib/types';

interface PageProps {
    params: Promise<{ courseId: string; lessonId: string }>;
}

export default function LessonWorkspacePage({ params }: PageProps) {
    const { courseId, lessonId } = use(params);
    const { studentName } = useAppContext();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [loading, setLoading] = useState(true);

    // Collapsible states
    const [showInstructions, setShowInstructions] = useState(true);
    const [showEditor, setShowEditor] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    const course = getCourseById(courseId);
    const langConfig = course ? getLanguageConfig(course.language) : null;

    // Load lesson
    useEffect(() => {
        async function loadLesson() {
            setLoading(true);

            // Check sample lessons first
            const sampleLessons = getLessonsByCourse(courseId);
            const sampleLesson = sampleLessons.find(l => l.id === lessonId);

            if (sampleLesson) {
                setLesson(sampleLesson);
                setCode(sampleLesson.initialCode);
            } else if (courseId === 'python') {
                // Load from database
                try {
                    const res = await fetch(`/api/teacher/lessons`);
                    const lessons = await res.json();
                    const found = lessons.find((l: Lesson) => l.id === lessonId);
                    if (found) {
                        setLesson(found);
                        setCode(found.initialCode);
                    }
                } catch (e) {
                    console.error('Failed to load lesson:', e);
                }
            }

            setLoading(false);
        }

        loadLesson();
    }, [courseId, lessonId]);

    // Get Monaco language
    const getMonacoLanguage = (lang?: CourseLanguage): string => {
        const map: Record<CourseLanguage, string> = {
            'python': 'python',
            'javascript': 'javascript',
            'html': 'html',
            'css': 'css',
            'html-css': 'html',
            'react': 'html',
            'tailwind': 'html'
        };
        return map[lang || 'python'] || 'plaintext';
    };

    // Run code (for Python/JS via Judge0)
    const runCode = async () => {
        if (!langConfig || langConfig.usePreview) return;

        setIsRunning(true);
        setOutput('Running...');
        setStatus('idle');

        try {
            const res = await fetch('/api/judge0/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_code: code,
                    language_id: langConfig.judge0Id,
                    stdin: ''
                })
            });

            const data = await res.json();

            if (data.stdout) {
                setOutput(data.stdout);

                // Check expected output
                if (lesson?.expectedOutput && data.stdout.trim().includes(lesson.expectedOutput.trim())) {
                    setStatus('success');
                    saveProgress();
                } else {
                    setStatus('error');
                }
            } else if (data.stderr) {
                setOutput(`Error:\n${data.stderr}`);
                setStatus('error');
            } else if (data.compile_output) {
                setOutput(`Compile Error:\n${data.compile_output}`);
                setStatus('error');
            } else {
                setOutput('No output');
            }
        } catch (e) {
            setOutput('Execution failed: ' + (e as Error).message);
            setStatus('error');
        }

        setIsRunning(false);
    };

    // Handle HTML/CSS validation result
    const handleValidationResult = (passed: boolean, message: string) => {
        if (passed) {
            setStatus('success');
            saveProgress();
        } else {
            setStatus('error');
        }
        setOutput(message);
    };

    // Save progress
    const saveProgress = async () => {
        if (!studentName || !lesson) return;

        try {
            await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId: lesson.id,
                    studentName,
                    status: 'success',
                    code
                })
            });
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    };

    // Reset code
    const resetCode = () => {
        if (lesson) {
            setCode(lesson.initialCode);
            setOutput('');
            setStatus('idle');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!lesson || !course) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-white mb-4">Lesson tidak ditemukan</h1>
                    <Link href={`/learn/${courseId}`} className="text-purple-400">
                        ← Kembali
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-900">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/learn/${courseId}`}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{course.icon}</span>
                        <div>
                            <h1 className="text-white font-semibold">{lesson.title}</h1>
                            <p className="text-xs text-gray-400">{course.title}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status === 'success' && (
                        <div className="flex items-center gap-1 text-green-400">
                            <CheckCircle size={18} />
                            <span className="text-sm">Completed!</span>
                        </div>
                    )}
                    <button
                        onClick={resetCode}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left: Instructions (Collapsible) */}
                <div className={`border-r border-slate-700 flex flex-col transition-all duration-300 ${showInstructions ? 'w-1/3' : 'w-12'}`}>
                    {/* Toggle Header */}
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-purple-400" />
                            {showInstructions && <span className="text-sm text-gray-300">Instruksi</span>}
                        </div>
                        {showInstructions ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {/* Content */}
                    {showInstructions && (
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Task */}
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                                <h2 className="text-purple-400 font-semibold mb-2 flex items-center gap-2">
                                    <BookOpen size={18} />
                                    Tugas
                                </h2>
                                <p className="text-white text-sm">{lesson.task}</p>
                            </div>

                            {/* Content */}
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{lesson.content}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Editor + Preview */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Editor Section (Collapsible) */}
                    <div className={`flex flex-col transition-all duration-300 ${showEditor ? 'flex-1' : 'h-10'} ${!showPreview ? 'flex-1' : ''}`}>
                        {/* Editor Header */}
                        <button
                            onClick={() => setShowEditor(!showEditor)}
                            className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 hover:bg-slate-700 transition-colors shrink-0"
                        >
                            <div className="flex items-center gap-2">
                                <Code size={16} className="text-blue-400" />
                                <span className="text-sm text-gray-300">Code Editor</span>
                            </div>
                            {showEditor ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </button>

                        {/* Editor */}
                        {showEditor && (
                            <div className="flex-1 min-h-0">
                                <Editor
                                    height="100%"
                                    language={getMonacoLanguage(lesson.language)}
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        lineNumbers: 'on',
                                        automaticLayout: true,
                                        padding: { top: 16 }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Preview/Output Section (Collapsible) */}
                    <div className={`flex flex-col border-t border-slate-700 transition-all duration-300 ${showPreview ? 'flex-1' : 'h-10'} ${!showEditor ? 'flex-1' : ''}`}>
                        {/* Preview Header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0">
                            <div
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                            >
                                <Eye size={16} className="text-green-400" />
                                <span className="text-sm text-gray-300">
                                    {langConfig?.usePreview ? 'Preview' : 'Output'}
                                </span>
                                {showPreview ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                            </div>
                            <div className="flex items-center gap-2">
                                {!langConfig?.usePreview && (
                                    <button
                                        onClick={runCode}
                                        disabled={isRunning}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                                    >
                                        <Play size={12} />
                                        {isRunning ? 'Running...' : 'Run'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Preview Content */}
                        {showPreview && (
                            <div className="flex-1 min-h-0 overflow-hidden">
                                {langConfig?.usePreview ? (
                                    <HtmlPreview
                                        code={code}
                                        validationCode={lesson.validationCode}
                                        validationType={lesson.validationType as 'html' | 'css'}
                                        onValidationResult={handleValidationResult}
                                    />
                                ) : (
                                    <div className={`h-full p-4 font-mono text-sm overflow-y-auto ${status === 'success' ? 'bg-green-900/20' :
                                        status === 'error' ? 'bg-red-900/20' :
                                            'bg-slate-950'
                                        }`}>
                                        <pre className={`whitespace-pre-wrap ${status === 'success' ? 'text-green-400' :
                                            status === 'error' ? 'text-red-400' :
                                                'text-gray-300'
                                            }`}>
                                            {output || 'Click "Run" to see output...'}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
