/**
 * Exam Security Hook
 * 
 * Provides security layers for online exams:
 * - Fullscreen enforcement
 * - Tab/window violation detection
 * - Disable copy/paste/right-click
 * - Violation logging
 * - Device fingerprinting
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
export interface Violation {
    type: 'fullscreen_exit' | 'tab_switch' | 'window_blur' | 'copy_attempt' | 'paste_attempt' |
    'right_click' | 'devtools' | 'refresh' | 'print_screen';
    timestamp: Date;
    count: number;
}

export interface DeviceFingerprint {
    os: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
    timezone: string;
    language: string;
    userAgent: string;
}

export interface ExamSecurityConfig {
    enableFullscreen?: boolean;
    maxFullscreenExits?: number;
    enableCopyPasteBlock?: boolean;
    enableRightClickBlock?: boolean;
    enableTabDetection?: boolean;
    onViolation?: (violation: Violation) => void;
    onMaxViolations?: () => void;
    onAutoSubmit?: () => void;
}

export interface ExamSecurityState {
    isFullscreen: boolean;
    violations: Violation[];
    totalViolations: number;
    deviceFingerprint: DeviceFingerprint | null;
    isSecure: boolean;
}

const defaultConfig: ExamSecurityConfig = {
    enableFullscreen: true,
    maxFullscreenExits: 3,
    enableCopyPasteBlock: true,
    enableRightClickBlock: true,
    enableTabDetection: true,
};

export function useExamSecurity(config: ExamSecurityConfig = {}) {
    const mergedConfig = { ...defaultConfig, ...config };

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [deviceFingerprint, setDeviceFingerprint] = useState<DeviceFingerprint | null>(null);
    const violationCountRef = useRef<Record<string, number>>({});

    // Calculate total violations
    const totalViolations = violations.reduce((sum, v) => sum + v.count, 0);

    // Add violation
    const addViolation = useCallback((type: Violation['type']) => {
        const count = (violationCountRef.current[type] || 0) + 1;
        violationCountRef.current[type] = count;

        const violation: Violation = {
            type,
            timestamp: new Date(),
            count
        };

        setViolations(prev => [...prev, violation]);
        mergedConfig.onViolation?.(violation);

        // Check max violations for fullscreen
        if (type === 'fullscreen_exit' && count >= (mergedConfig.maxFullscreenExits || 3)) {
            mergedConfig.onMaxViolations?.();
            mergedConfig.onAutoSubmit?.();
        }

        return violation;
    }, [mergedConfig]);

    // Request fullscreen
    const requestFullscreen = useCallback(async () => {
        try {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if ((elem as any).webkitRequestFullscreen) {
                await (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).msRequestFullscreen) {
                await (elem as any).msRequestFullscreen();
            }
            return true;
        } catch (e) {
            console.error('Fullscreen request failed:', e);
            return false;
        }
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen();
            }
        } catch (e) {
            // Ignore
        }
    }, []);

    // Get device fingerprint
    const getDeviceFingerprint = useCallback((): DeviceFingerprint => {
        const ua = navigator.userAgent;
        let os = 'Unknown';
        let browser = 'Unknown';

        // Detect OS
        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS';

        // Detect Browser
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';

        return {
            os,
            browser,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            userAgent: ua
        };
    }, []);

    // Setup effects
    useEffect(() => {
        // Get fingerprint on mount
        setDeviceFingerprint(getDeviceFingerprint());

        // Fullscreen change handler
        const handleFullscreenChange = () => {
            const isFs = !!document.fullscreenElement;
            setIsFullscreen(isFs);

            if (!isFs && mergedConfig.enableFullscreen) {
                addViolation('fullscreen_exit');
            }
        };

        // Visibility change handler (tab switch)
        const handleVisibilityChange = () => {
            if (document.hidden && mergedConfig.enableTabDetection) {
                addViolation('tab_switch');
            }
        };

        // Window blur handler
        const handleBlur = () => {
            if (mergedConfig.enableTabDetection) {
                addViolation('window_blur');
            }
        };

        // Right click handler
        const handleContextMenu = (e: MouseEvent) => {
            if (mergedConfig.enableRightClickBlock) {
                e.preventDefault();
                addViolation('right_click');
            }
        };

        // Copy handler
        const handleCopy = (e: ClipboardEvent) => {
            if (mergedConfig.enableCopyPasteBlock) {
                e.preventDefault();
                addViolation('copy_attempt');
            }
        };

        // Paste handler
        const handlePaste = (e: ClipboardEvent) => {
            if (mergedConfig.enableCopyPasteBlock) {
                e.preventDefault();
                addViolation('paste_attempt');
            }
        };

        // Keyboard shortcuts handler
        const handleKeyDown = (e: KeyboardEvent) => {
            // Detect print screen
            if (e.key === 'PrintScreen') {
                addViolation('print_screen');
            }

            // Detect devtools (F12, Ctrl+Shift+I)
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
                addViolation('devtools');
            }

            // Block Ctrl+C, Ctrl+V, Ctrl+P
            if (e.ctrlKey && mergedConfig.enableCopyPasteBlock) {
                if (e.key === 'c' || e.key === 'C') {
                    e.preventDefault();
                    addViolation('copy_attempt');
                }
                if (e.key === 'v' || e.key === 'V') {
                    e.preventDefault();
                    addViolation('paste_attempt');
                }
            }
        };

        // Prevent text selection
        const handleSelectStart = (e: Event) => {
            if (mergedConfig.enableCopyPasteBlock) {
                e.preventDefault();
            }
        };

        // Add listeners
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('selectstart', handleSelectStart);

        // Cleanup
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('selectstart', handleSelectStart);
        };
    }, [mergedConfig, addViolation, getDeviceFingerprint]);

    return {
        // State
        isFullscreen,
        violations,
        totalViolations,
        deviceFingerprint,
        isSecure: isFullscreen && totalViolations === 0,

        // Actions
        requestFullscreen,
        exitFullscreen,
        addViolation,

        // Helpers
        getViolationCount: (type: Violation['type']) => violationCountRef.current[type] || 0,
        clearViolations: () => {
            setViolations([]);
            violationCountRef.current = {};
        }
    };
}

export default useExamSecurity;
