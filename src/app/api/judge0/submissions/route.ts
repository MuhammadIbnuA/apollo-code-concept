import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config";

export const dynamic = "force-dynamic";

const JUDGE0_URL = CONFIG.JUDGE0.API_URL;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Explicitly use native fetch for better Next.js compatibility
        console.log(`[Proxy] POST ${JUDGE0_URL}/submissions (Sync)`);

        const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            // Force no-cache/fresh connection behavior
            cache: "no-store",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Judge0 Error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: "Judge0 Error", details: errorText, status: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Proxy] Network Error:", message);

        return NextResponse.json(
            { error: "Failed to submit code", details: message },
            { status: 500 }
        );
    }
}
