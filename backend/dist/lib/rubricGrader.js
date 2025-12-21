"use strict";
/**
 * Rubric Grader
 * Code grading logic using Judge0 for Python execution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeWithRubric = gradeWithRubric;
exports.gradeWithAssertion = gradeWithAssertion;
const config_js_1 = require("../config.js");
const DEFAULT_RUBRIC_MARKER = '__RUBRIC__';
// ============================================================
// JUDGE0 CODE EXECUTION
// ============================================================
async function executeCode(sourceCode) {
    const judge0Url = config_js_1.config.judge0.apiUrl;
    try {
        const response = await fetch(`${judge0Url}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                source_code: sourceCode,
                language_id: config_js_1.config.judge0.pythonLanguageId,
                stdin: ''
            })
        });
        if (!response.ok) {
            throw new Error(`Judge0 returned ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('[RubricGrader] Judge0 execution error:', error);
        throw error;
    }
}
function parseRubricOutput(stdout, marker = DEFAULT_RUBRIC_MARKER) {
    if (!stdout)
        return null;
    const markerIndex = stdout.indexOf(marker);
    if (markerIndex === -1)
        return null;
    try {
        const jsonStr = stdout.substring(markerIndex + marker.length).trim();
        const parsed = JSON.parse(jsonStr);
        return {
            score: typeof parsed.score === 'number' ? parsed.score : 0,
            maxScore: typeof parsed.max_score === 'number' ? parsed.max_score : 0,
            breakdown: parsed.breakdown || {},
            errors: Array.isArray(parsed.errors) ? parsed.errors : []
        };
    }
    catch (e) {
        console.error('[RubricGrader] Failed to parse rubric JSON:', e);
        return null;
    }
}
// ============================================================
// GRADING FUNCTIONS
// ============================================================
/**
 * Grade a student's code using rubric-based validation
 */
async function gradeWithRubric(studentCode, validationCode, questionId, maxPoints, customMarker) {
    const marker = customMarker || DEFAULT_RUBRIC_MARKER;
    // Base64 encode student code for safe embedding
    const base64StudentCode = Buffer.from(studentCode, 'utf-8').toString('base64');
    // Build combined script
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
    }
    catch (error) {
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
 */
async function gradeWithAssertion(studentCode, validationCode, questionId, maxPoints) {
    // Base64 encode student code for safe embedding
    const base64StudentCode = Buffer.from(studentCode, 'utf-8').toString('base64');
    // Build script: embed validation code directly
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
    }
    catch (error) {
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
//# sourceMappingURL=rubricGrader.js.map