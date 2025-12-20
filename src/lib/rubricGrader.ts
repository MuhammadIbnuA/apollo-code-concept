import 'server-only';
import { GradeResult } from './types';

const DEFAULT_RUBRIC_MARKER = '__RUBRIC__';

interface Judge0Response {
    stdout: string | null;
    stderr: string | null;
    status: { id: number; description: string };
    compile_output: string | null;
    time: string;
    memory: number;
}

/**
 * Execute code via Judge0 API (server-side)
 */
async function executeCode(sourceCode: string): Promise<Judge0Response> {
    const judge0Url = process.env.JUDGE0_URL || 'http://129.212.236.32:2358';

    try {
        const response = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_code: sourceCode,
                language_id: 71, // Python 3.8.1
                stdin: ''
            })
        });

        if (!response.ok) {
            throw new Error(`Judge0 returned ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[RubricGrader] Judge0 execution error:', error);
        throw error;
    }
}

/**
 * Parse rubric result from Judge0 output
 */
function parseRubricOutput(
    stdout: string | null,
    marker: string = DEFAULT_RUBRIC_MARKER
): { score: number; maxScore: number; breakdown: Record<string, number>; errors: string[] } | null {
    if (!stdout) return null;

    const markerIndex = stdout.indexOf(marker);
    if (markerIndex === -1) return null;

    try {
        const jsonStr = stdout.substring(markerIndex + marker.length).trim();
        const parsed = JSON.parse(jsonStr);

        return {
            score: typeof parsed.score === 'number' ? parsed.score : 0,
            maxScore: typeof parsed.max_score === 'number' ? parsed.max_score : 0,
            breakdown: parsed.breakdown || {},
            errors: Array.isArray(parsed.errors) ? parsed.errors : []
        };
    } catch (e) {
        console.error('[RubricGrader] Failed to parse rubric JSON:', e);
        return null;
    }
}

/**
 * Grade a student's code using rubric-based validation
 * 
 * @param studentCode - The student's submitted code
 * @param validationCode - The validation/grading code (should output __RUBRIC__ + JSON)
 * @param questionId - Question identifier
 * @param maxPoints - Maximum points for this question (fallback)
 * @param customMarker - Custom marker for parsing (default: __RUBRIC__)
 */
export async function gradeWithRubric(
    studentCode: string,
    validationCode: string,
    questionId: string,
    maxPoints: number,
    customMarker?: string
): Promise<GradeResult> {
    const marker = customMarker || DEFAULT_RUBRIC_MARKER;

    // Base64 encode student code for safe embedding
    const base64StudentCode = Buffer.from(studentCode, 'utf-8').toString('base64');

    // Build combined script:
    // 1. Define __STUDENT_CODE__ 
    // 2. Execute student code via exec
    // 3. Run validation code DIRECTLY (not via exec)
    const combinedCode = `import base64
import ast
import json

# Store student code as string (for AST analysis)
__STUDENT_CODE__ = base64.b64decode("${base64StudentCode}").decode('utf-8')
__exec_error__ = None

# Execute student code
try:
    exec(__STUDENT_CODE__)
except Exception as e:
    __exec_error__ = str(e)

# === VALIDATION CODE (runs directly, not via exec) ===
${validationCode}
`;

    try {
        const result = await executeCode(combinedCode);

        // Check for execution errors
        if (result.status.id !== 3) { // 3 = Accepted
            return {
                questionId,
                score: 0,
                maxScore: maxPoints,
                breakdown: {},
                errors: [result.stderr || result.compile_output || result.status.description],
                status: result.status.id === 5 ? 'timeout' : 'error'
            };
        }

        // Parse rubric output
        const rubricResult = parseRubricOutput(result.stdout, marker);

        if (!rubricResult) {
            // Fallback: If no rubric marker found, check for errors
            if (result.stderr) {
                return {
                    questionId,
                    score: 0,
                    maxScore: maxPoints,
                    breakdown: {},
                    errors: ['assertion_failed'],
                    status: 'graded'
                };
            }
            // No errors = full points (simple pass/fail)
            return {
                questionId,
                score: maxPoints,
                maxScore: maxPoints,
                breakdown: { 'passed': maxPoints },
                errors: [],
                status: 'graded'
            };
        }

        return {
            questionId,
            score: rubricResult.score,
            maxScore: rubricResult.maxScore || maxPoints,
            breakdown: rubricResult.breakdown,
            errors: rubricResult.errors,
            status: 'graded'
        };

    } catch (error) {
        console.error('[RubricGrader] Grading failed:', error);
        return {
            questionId,
            score: 0,
            maxScore: maxPoints,
            breakdown: {},
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            status: 'error'
        };
    }
}

/**
 * Grade using simple assertion (fallback for non-rubric questions)
 * Also injects __STUDENT_CODE__ for compatibility
 */
export async function gradeWithAssertion(
    studentCode: string,
    validationCode: string,
    questionId: string,
    maxPoints: number
): Promise<GradeResult> {
    // Base64 encode student code for safe embedding
    const base64StudentCode = Buffer.from(studentCode, 'utf-8').toString('base64');

    // Build script: embed validation code directly (not via exec)
    const combinedCode = `import base64
import ast
import json

# Store student code as string
__STUDENT_CODE__ = base64.b64decode("${base64StudentCode}").decode('utf-8')
__exec_error__ = None

# Execute student code
try:
    exec(__STUDENT_CODE__)
except Exception as e:
    __exec_error__ = str(e)

# === VALIDATION CODE ===
${validationCode}
`;

    try {
        const result = await executeCode(combinedCode);

        // No stderr means passed
        const passed = !result.stderr && result.status.id === 3;

        return {
            questionId,
            score: passed ? maxPoints : 0,
            maxScore: maxPoints,
            breakdown: passed ? { 'all_tests': maxPoints } : { 'all_tests': 0 },
            errors: passed ? [] : ['assertion_failed'],
            status: 'graded'
        };

    } catch (error) {
        return {
            questionId,
            score: 0,
            maxScore: maxPoints,
            breakdown: {},
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            status: 'error'
        };
    }
}
