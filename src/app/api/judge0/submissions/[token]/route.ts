import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config";

export const dynamic = "force-dynamic";

const JUDGE0_URL = CONFIG.JUDGE0.API_URL;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        console.log(`[Proxy] GET ${JUDGE0_URL}/submissions/${token}`);

        const response = await fetch(
            `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status,message,compile_output,time,memory`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Proxy] Judge0 Status Error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: "Judge0 Status Error", details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Proxy] Status Network Error:", message);

        return NextResponse.json(
            { error: "Failed to fetch status", details: message },
            { status: 500 }
        );
    }
}
