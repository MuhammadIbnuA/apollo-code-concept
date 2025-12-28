import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const ua = req.headers.get('user-agent') || '';

    // Check if user agent indicates mobile device
    const isMobile = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // Get the path
    const path = req.nextUrl.pathname;

    // Skip blocking for:
    // - API routes
    // - Static files
    // - The desktop-only page itself
    // - Next.js internals
    const skipPaths = [
        '/api',
        '/_next',
        '/favicon.ico',
        '/desktop-only',
        '/images',
        '/fonts',
    ];

    const shouldSkip = skipPaths.some(p => path.startsWith(p));

    if (isMobile && !shouldSkip) {
        // Redirect mobile users to desktop-only page
        return NextResponse.redirect(new URL('/desktop-only', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next (Next.js internals)
         * - _vercel (Vercel internals)
         * - Static files (favicon, images, etc.)
         */
        '/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)',
    ],
};
