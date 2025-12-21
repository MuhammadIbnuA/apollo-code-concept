/**
 * K6 Judge0 Performance Test
 * Tests each question submission individually to measure Judge0 response times
 * 
 * NO TIME LIMIT - runs until all VUs complete
 * 
 * Usage:
 *   k6 run tests/k6/judge0_performance_test.js
 *   k6 run tests/k6/judge0_performance_test.js -e VUS=100 -e BASE_URL=https://apollo-code-concept.vercel.app
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_URL = __ENV.BASE_URL || 'https://apollo-code-concept.vercel.app';
const VUS = parseInt(__ENV.VUS || '100');
const QUESTIONS_PER_STUDENT = parseInt(__ENV.QUESTIONS || '10');

export const options = {
    scenarios: {
        exam_session: {
            executor: 'per-vu-iterations',
            vus: VUS,
            iterations: 1,  // Each VU runs once (one student)
            maxDuration: '30m',  // Allow up to 30 minutes
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.3'],  // Allow some failures
        judge0_per_question: ['p(95)<30000'],  // 95% under 30s per question
    },
};

// ============================================================
// CUSTOM METRICS
// ============================================================

const judge0PerQuestion = new Trend('judge0_per_question', true);
const judge0Total = new Trend('judge0_total_per_student', true);
const submissionSuccess = new Rate('submission_success');
const questionSuccess = new Counter('questions_passed');
const questionFailed = new Counter('questions_failed');
const studentsCompleted = new Counter('students_completed');

// ============================================================
// TEST CODE SAMPLES
// ============================================================

const PYTHON_CODES = [
    { name: 'Q1_print', code: `def print_pesan(teks):\n    print(teks)\n\nprint_pesan("Hello")`, expected: 'Hello' },
    { name: 'Q2_tambah', code: `def tambah(a, b):\n    return a + b\n\nprint(tambah(5, 3))`, expected: '8' },
    { name: 'Q3_luas', code: `def luas(p, l):\n    return p * l\n\nprint(luas(4, 5))`, expected: '20' },
    { name: 'Q4_lingkaran', code: `def luas_lingkaran(r):\n    return 3.14 * r * r\n\nprint(luas_lingkaran(7))`, expected: '153.86' },
    { name: 'Q5_rata', code: `def rata_rata(daftar):\n    return sum(daftar) / len(daftar)\n\nprint(rata_rata([10, 20, 30]))`, expected: '20' },
    { name: 'Q6_min', code: `def minimum(daftar):\n    return min(daftar)\n\nprint(minimum([5, 2, 8, 1]))`, expected: '1' },
    { name: 'Q7_lulus', code: `def lulus(nilai):\n    return "Lulus" if nilai >= 75 else "Tidak Lulus"\n\nprint(lulus(80))`, expected: 'Lulus' },
    { name: 'Q8_faktorial', code: `def faktorial(n):\n    if n <= 1: return 1\n    return n * faktorial(n-1)\n\nprint(faktorial(5))`, expected: '120' },
    { name: 'Q9_prima', code: `def prima(n):\n    if n < 2: return False\n    for i in range(2, n):\n        if n % i == 0: return False\n    return True\n\nprint(prima(7))`, expected: 'True' },
    { name: 'Q10_fib', code: `def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\nprint(fib(10))`, expected: '55' },
];

// ============================================================
// MAIN TEST
// ============================================================

export default function () {
    const vuId = __VU;
    const studentName = `Student_${vuId}`;

    console.log(`\n[VU ${vuId}] ${studentName} starting exam...`);

    const studentStartTime = Date.now();
    let questionsCorrect = 0;
    let questionsFailed = 0;
    const questionTimes = [];

    // Submit each question to Judge0
    for (let i = 0; i < QUESTIONS_PER_STUDENT && i < PYTHON_CODES.length; i++) {
        const q = PYTHON_CODES[i];

        // Small delay between questions (realistic typing)
        if (i > 0) sleep(randomIntBetween(2, 5));

        const questionStartTime = Date.now();

        // Submit to Judge0 via API route
        const payload = JSON.stringify({
            source_code: q.code,
            language_id: 71,  // Python 3
            stdin: ''
        });

        const res = http.post(`${BASE_URL}/api/judge0/submissions`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '60s',  // 60 second timeout per question
            tags: { name: `judge0_${q.name}` }
        });

        const questionTime = Date.now() - questionStartTime;
        questionTimes.push(questionTime);
        judge0PerQuestion.add(questionTime);

        let passed = false;
        if (res.status === 200) {
            try {
                const data = JSON.parse(res.body);
                const stdout = (data.stdout || '').trim();
                passed = stdout.includes(q.expected);

                if (passed) {
                    questionsCorrect++;
                    questionSuccess.add(1);
                } else {
                    questionsFailed++;
                    questionFailed.add(1);
                }

                console.log(`  [${q.name}] ${passed ? '✅' : '❌'} ${questionTime}ms - Got: "${stdout.substring(0, 50)}"`);
            } catch (e) {
                questionsFailed++;
                questionFailed.add(1);
                console.log(`  [${q.name}] ❌ Parse error ${questionTime}ms`);
            }
        } else {
            questionsFailed++;
            questionFailed.add(1);
            console.log(`  [${q.name}] ❌ HTTP ${res.status} ${questionTime}ms`);
        }

        submissionSuccess.add(passed);
    }

    const totalTime = Date.now() - studentStartTime;
    judge0Total.add(totalTime);
    studentsCompleted.add(1);

    const avgQuestionTime = questionTimes.length > 0
        ? Math.round(questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length)
        : 0;

    console.log(`[VU ${vuId}] COMPLETED: ${questionsCorrect}/${QUESTIONS_PER_STUDENT} correct, Total: ${totalTime}ms, Avg/Q: ${avgQuestionTime}ms`);
}

// ============================================================
// SUMMARY
// ============================================================

export function handleSummary(data) {
    const studentsCount = data.metrics.students_completed ? data.metrics.students_completed.values.count : 0;
    const questionsPass = data.metrics.questions_passed ? data.metrics.questions_passed.values.count : 0;
    const questionsFail = data.metrics.questions_failed ? data.metrics.questions_failed.values.count : 0;
    const totalQuestions = questionsPass + questionsFail;

    const avgPerQuestion = data.metrics.judge0_per_question ? Math.round(data.metrics.judge0_per_question.values.avg) : 0;
    const p50PerQuestion = data.metrics.judge0_per_question ? Math.round(data.metrics.judge0_per_question.values.med) : 0;
    const p95PerQuestion = data.metrics.judge0_per_question ? Math.round(data.metrics.judge0_per_question.values['p(95)']) : 0;
    const maxPerQuestion = data.metrics.judge0_per_question ? Math.round(data.metrics.judge0_per_question.values.max) : 0;

    const avgPerStudent = data.metrics.judge0_total_per_student ? Math.round(data.metrics.judge0_total_per_student.values.avg) : 0;
    const successRate = data.metrics.submission_success ? Math.round(data.metrics.submission_success.values.rate * 100) : 0;

    const summary = `
╔══════════════════════════════════════════════════════════════════════════╗
║            JUDGE0 PERFORMANCE TEST - ${VUS} CONCURRENT STUDENTS               ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Students Completed:    ${String(studentsCount).padEnd(10)}                               ║
║  Total Questions:       ${String(totalQuestions).padEnd(10)}                               ║
║  Questions Passed:      ${String(questionsPass).padEnd(10)}                               ║
║  Questions Failed:      ${String(questionsFail).padEnd(10)}                               ║
║  Success Rate:          ${String(successRate).padEnd(3)}%                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  JUDGE0 RESPONSE TIME PER QUESTION:                                      ║
║    Average:             ${String(avgPerQuestion).padEnd(8)}ms                               ║
║    Median (P50):        ${String(p50PerQuestion).padEnd(8)}ms                               ║
║    P95:                 ${String(p95PerQuestion).padEnd(8)}ms                               ║
║    Max:                 ${String(maxPerQuestion).padEnd(8)}ms                               ║
╠══════════════════════════════════════════════════════════════════════════╣
║  TOTAL TIME PER STUDENT (${QUESTIONS_PER_STUDENT} questions):                                 ║
║    Average:             ${String(avgPerStudent).padEnd(8)}ms (${String(Math.round(avgPerStudent / 1000)).padEnd(3)}s)                      ║
╚══════════════════════════════════════════════════════════════════════════╝
`;

    console.log(summary);

    return {
        stdout: summary,
        'tests/k6/results/judge0_performance_results.json': JSON.stringify(data, null, 2)
    };
}
