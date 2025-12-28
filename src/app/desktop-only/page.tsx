import { Monitor, Smartphone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DesktopOnlyPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
            <div className="text-center max-w-lg">
                {/* Icon */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/30">
                        <Smartphone className="w-16 h-16 text-destructive" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-1 bg-destructive rotate-45 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold mb-4 text-primary">
                    Desktop Required
                </h1>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    Apollo Learning Platform membutuhkan <strong className="text-foreground">laptop atau komputer desktop</strong> untuk pengalaman belajar yang optimal.
                </p>

                {/* Reason Card */}
                <div className="bg-card rounded-2xl p-6 border border-border mb-8 text-left shadow-sm">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-primary" />
                        Mengapa Desktop?
                    </h3>

                    <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">💻</span>
                            <span>Code editor membutuhkan layar lebar untuk mengetik dengan nyaman</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">🔒</span>
                            <span>Exam mode membutuhkan fullscreen yang tidak tersedia di mobile</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">⌨️</span>
                            <span>Mengetik kode dengan keyboard fisik jauh lebih efisien</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary mt-1">📊</span>
                            <span>Tampilan split-screen (materi + editor) membutuhkan resolusi tinggi</span>
                        </li>
                    </ul>
                </div>

                {/* Supported Devices */}
                <div className="bg-success/10 rounded-xl p-4 border border-success/30 mb-8">
                    <p className="text-success font-medium mb-2">✅ Perangkat yang Didukung:</p>
                    <p className="text-muted-foreground text-sm">
                        Laptop • Desktop PC • MacBook • iMac • Tablet dalam Landscape Mode (beberapa fitur)
                    </p>
                </div>

                {/* Minimum Requirements */}
                <div className="text-sm text-muted-foreground mb-6">
                    <p className="mb-2">📐 Kebutuhan Minimum:</p>
                    <p>Resolusi layar ≥ <strong className="text-foreground">1024 x 768</strong></p>
                </div>

                {/* Back Link (for testing) */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Beranda (hanya untuk testing)
                </Link>
            </div>
        </div>
    );
}
