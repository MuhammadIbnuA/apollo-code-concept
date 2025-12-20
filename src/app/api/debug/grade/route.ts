import { NextResponse } from "next/server";

/**
 * Debug endpoint to test grading engine directly
 * POST /api/debug/grade
 * Body: { studentCode: string, validationCode: string }
 */
export async function POST(req: Request) {
    try {
        const { studentCode, validationCode } = await req.json();

        // Base64 encode for safe transmission
        const base64StudentCode = Buffer.from(studentCode || '', 'utf-8').toString('base64');
        const base64ValidationCode = Buffer.from(validationCode || '', 'utf-8').toString('base64');

        // Build script - same as rubricGrader.ts
        const combinedCode = `import base64
import ast
import json

# Decode student code and store in globals
globals()['__STUDENT_CODE__'] = base64.b64decode("${base64StudentCode}").decode('utf-8')
globals()['__exec_error__'] = None

# Execute student code in global namespace
try:
    exec(globals()['__STUDENT_CODE__'], globals())
except Exception as e:
    globals()['__exec_error__'] = str(e)

# Execute validation code in same global namespace
__validation_code__ = base64.b64decode("${base64ValidationCode}").decode('utf-8')
exec(__validation_code__, globals())
`;

        // Execute via Judge0
        const judge0Url = process.env.JUDGE0_URL || 'http://129.212.236.32:2358';

        const response = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_code: combinedCode,
                language_id: 71,
                stdin: ''
            })
        });

        const result = await response.json();

        return NextResponse.json({
            success: true,
            combinedCodePreview: combinedCode.substring(0, 500) + '...',
            judge0Response: {
                status: result.status,
                stdout: result.stdout,
                stderr: result.stderr,
                compile_output: result.compile_output
            }
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
