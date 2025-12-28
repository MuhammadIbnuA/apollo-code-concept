'use client';

import { useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

interface DesktopGuardProps {
    children: React.ReactNode;
    minWidth?: number;
}

/**
 * Desktop Guard Component
 * 
 * Blocks access on mobile devices and small screens.
 * Shows a friendly message asking users to switch to desktop.
 */
export default function DesktopGuard({
    children,
    minWidth = 1024
}: DesktopGuardProps) {
    const [isDesktop, setIsDesktop] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkDevice = () => {
            // Check screen width
            const widthOk = window.innerWidth >= minWidth;

            // Also check user agent for mobile devices
            const ua = navigator.userAgent;
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

            // Consider it desktop if width is OK and not mobile UA
            // But if width is OK, allow even on tablets in landscape
            setIsDesktop(widthOk && !isMobileUA);
            setIsLoading(false);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, [minWidth]);

    // Show nothing while checking
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f0f16]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show block message on mobile
    if (!isDesktop) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#0f0f16] to-[#1a1a2e] text-white p-6">
                <div className="text-center max-w-md">
                    <div className="relative mb-8">
                        <Smartphone className="w-20 h-20 mx-auto text-red-400 opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-1 bg-red-500 rotate-45 rounded"></div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold mb-4 text-white">
                        🖥️ Desktop Required
                    </h1>

                    <p className="text-gray-400 mb-6 leading-relaxed">
                        This application requires a <strong className="text-blue-400">laptop or desktop computer</strong> for the best experience.
                    </p>

                    <div className="bg-[#1e1e2e] rounded-xl p-6 border border-[#27273a] mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Monitor className="w-8 h-8 text-green-400" />
                            <div className="text-left">
                                <p className="font-medium text-white">Recommended</p>
                                <p className="text-sm text-gray-400">Screen width ≥ {minWidth}px</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500">
                            Features like code editing, fullscreen exams, and interactive lessons work best on larger screens.
                        </p>
                    </div>

                    <div className="text-sm text-gray-500">
                        <p>📩 Silakan akses menggunakan:</p>
                        <ul className="mt-2 space-y-1">
                            <li>✅ Laptop</li>
                            <li>✅ Desktop PC</li>
                            <li>✅ Tablet dalam mode landscape (beberapa fitur)</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
