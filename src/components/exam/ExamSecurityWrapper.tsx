'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Shield, Monitor, Eye, Clock, X } from 'lucide-react';
import { useExamSecurity, Violation, DeviceFingerprint } from '@/hooks/useExamSecurity';

interface ExamSecurityWrapperProps {
    children: React.ReactNode;
    examId: string;
    studentName: string;
    maxViolations?: number;
    onAutoSubmit?: () => void;
    onViolation?: (violation: Violation) => void;
}

/**
 * Exam Security Wrapper Component
 * 
 * Wraps exam content with security layers:
 * - Fullscreen enforcement with modal prompts
 * - Violation warning overlays
 * - Security status indicator
 */
export default function ExamSecurityWrapper({
    children,
    examId,
    studentName,
    maxViolations = 5,
    onAutoSubmit,
    onViolation
}: ExamSecurityWrapperProps) {
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [showStartModal, setShowStartModal] = useState(true);
    const [examStarted, setExamStarted] = useState(false);

    const handleViolation = useCallback((violation: Violation) => {
        onViolation?.(violation);

        // Show warning for important violations
        const warningTypes = ['fullscreen_exit', 'tab_switch', 'copy_attempt', 'devtools'];
        if (warningTypes.includes(violation.type)) {
            const messages: Record<string, string> = {
                fullscreen_exit: `⚠️ Anda keluar dari mode fullscreen! (Peringatan ${violation.count}/3)`,
                tab_switch: `⚠️ Terdeteksi perpindahan tab/window!`,
                copy_attempt: `⚠️ Aksi copy tidak diizinkan!`,
                paste_attempt: `⚠️ Aksi paste tidak diizinkan!`,
                devtools: `⚠️ Membuka DevTools tidak diizinkan!`,
                right_click: `⚠️ Klik kanan dinonaktifkan!`,
            };

            setWarningMessage(messages[violation.type] || 'Pelanggaran terdeteksi!');
            setShowWarning(true);

            // Auto hide after 3 seconds
            setTimeout(() => setShowWarning(false), 3000);
        }
    }, [onViolation]);

    const {
        isFullscreen,
        violations,
        totalViolations,
        deviceFingerprint,
        requestFullscreen,
    } = useExamSecurity({
        enableFullscreen: true,
        maxFullscreenExits: 3,
        enableCopyPasteBlock: true,
        enableRightClickBlock: true,
        enableTabDetection: true,
        onViolation: handleViolation,
        onAutoSubmit,
    });

    // Start exam in fullscreen
    const startExam = async () => {
        const success = await requestFullscreen();
        if (success) {
            setShowStartModal(false);
            setExamStarted(true);
        } else {
            alert('Tidak dapat masuk mode fullscreen. Pastikan browser mendukung fullscreen mode.');
        }
    };

    // Re-enter fullscreen when exited
    const reenterFullscreen = async () => {
        await requestFullscreen();
        setShowWarning(false);
    };

    // Log violations to server (optional)
    useEffect(() => {
        if (violations.length > 0 && examStarted) {
            // You can send this to your API
            console.log('[Security] Violations:', violations);
            console.log('[Security] Device:', deviceFingerprint);
        }
    }, [violations, deviceFingerprint, examStarted]);

    // Check for auto-submit
    useEffect(() => {
        if (totalViolations >= maxViolations) {
            onAutoSubmit?.();
        }
    }, [totalViolations, maxViolations, onAutoSubmit]);

    return (
        <div className="relative min-h-screen">
            {/* Start Exam Modal */}
            {showStartModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-lg mx-4 shadow-2xl">
                        <div className="text-center mb-6">
                            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Peraturan Ujian Online
                            </h2>
                            <p className="text-gray-600">
                                Mohon baca dan pahami peraturan berikut
                            </p>
                        </div>

                        <div className="space-y-3 mb-6 text-sm">
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <Monitor className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Mode Fullscreen Wajib</p>
                                    <p className="text-gray-600">Ujian akan berlangsung dalam mode fullscreen. Keluar fullscreen akan dicatat sebagai pelanggaran.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                <Eye className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Aktivitas Dimonitor</p>
                                    <p className="text-gray-600">Perpindahan tab, copy/paste, dan aktivitas mencurigakan akan tercatat.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Batas Pelanggaran</p>
                                    <p className="text-gray-600">Maksimal {maxViolations} pelanggaran. Lebih dari itu ujian akan otomatis disubmit.</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={startExam}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-lg"
                            >
                                🚀 Mulai Ujian
                            </button>
                            <p className="text-xs text-gray-500 mt-3">
                                Dengan menekan tombol di atas, Anda menyetujui peraturan ujian
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Overlay */}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">{warningMessage}</span>
                        <button onClick={() => setShowWarning(false)}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Fullscreen Exit Prompt */}
            {!isFullscreen && examStarted && !showStartModal && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            Mode Fullscreen Diperlukan
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Anda telah keluar dari mode fullscreen.
                            Klik tombol di bawah untuk melanjutkan ujian.
                        </p>
                        <p className="text-red-600 text-sm mb-4">
                            Pelanggaran fullscreen: {violations.filter(v => v.type === 'fullscreen_exit').length}/3
                        </p>
                        <button
                            onClick={reenterFullscreen}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Kembali ke Fullscreen
                        </button>
                    </div>
                </div>
            )}

            {/* Security Status Indicator */}
            {examStarted && (
                <div className="fixed top-4 right-4 z-40">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${totalViolations === 0
                            ? 'bg-green-100 text-green-800'
                            : totalViolations < maxViolations / 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                        <Shield className="w-4 h-4" />
                        <span>Pelanggaran: {totalViolations}/{maxViolations}</span>
                    </div>
                </div>
            )}

            {/* Exam Content */}
            {examStarted && (
                <div className="select-none">
                    {children}
                </div>
            )}
        </div>
    );
}
