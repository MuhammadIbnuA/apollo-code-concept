/**
 * K6 Realistic Load Test: 100 Concurrent Students Taking Alpro Exam
 * 
 * Simulates a real classroom scenario where 100 students take the exam simultaneously
 * 
 * Usage:
 *   k6 run tests/k6/exam_100_students.js
 *   k6 run tests/k6/exam_100_students.js -e BASE_URL=https://your-app.vercel.app
 * 
 * What this tests:
 * 1. 100 students access the exam page at the same time
 * 2. Each student works on questions with realistic think time
 * 3. Students submit at staggered times (like real exam)
 * 4. Measures: grading time, Judge0 response, success rate, scores
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ============================================================
// CONFIGURATION
// ============================================================

const BASE_URL = __ENV.BASE_URL || 'https://apollo-code-concept.vercel.app';
const EXAM_ID = __ENV.EXAM_ID || 'alpro-functions';

// Realistic scenario: 100 students, ramping up over 2 minutes
export const options = {
    scenarios: {
        exam_session: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 50 },   // 50 students join in first 30s
                { duration: '30s', target: 100 },  // 100 students by 1 minute
                { duration: '5m', target: 100 },   // All 100 work for 5 minutes
                { duration: '1m', target: 0 },     // Students finish and leave
            ],
            gracefulStop: '2m',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.1'],             // Less than 10% request failures
        http_req_duration: ['p(95)<30000'],        // 95% of requests under 30s
        exam_submit_success: ['rate>0.7'],         // 70%+ submissions succeed
        exam_grading_time: ['p(95)<60000'],        // Grading under 60s for 95%
    },
};

// ============================================================
// CUSTOM METRICS
// ============================================================

const examSubmitSuccess = new Rate('exam_submit_success');
const examGradingTime = new Trend('exam_grading_time', true);
const examScores = new Trend('exam_scores');
const passedStudents = new Counter('passed_students');
const failedStudents = new Counter('failed_students');
const judge0ResponseTime = new Trend('judge0_response_time', true);

// ============================================================
// CORRECT ANSWERS FOR ALPRO-FUNCTIONS EXAM
// ============================================================

const CORRECT_ANSWERS = {
    Q1: `def print_pesan(teks):
    print(teks)`,
    Q2: `def tambah(a, b):
    return a + b`,
    Q3: `def tambah(a, b):
    return a + b

hasil = tambah(10, 20)
print(hasil)`,
    Q4: `def luas_persegi_panjang(p, l):
    return p * l`,
    Q5: `def luas_lingkaran(r):
    return 3.14 * r * r`,
    Q6: `def nilai_minimum(daftar):
    minimum = daftar[0]
    for angka in daftar:
        if angka < minimum:
            minimum = angka
    return minimum`,
    Q7: `def rata_rata(daftar):
    total = 0
    for angka in daftar:
        total += angka
    return total / len(daftar)`,
    Q8: `def status_kelulusan(nilai):
    if nilai >= 75:
        return "Lulus"
    else:
        return "Tidak Lulus"`,
    Q9: `def faktorial(n):
    if n == 0 or n == 1:
        return 1
    return n * faktorial(n - 1)`,
    Q10: `def cek_prima(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return True`
};

// Partial answers (minor mistakes)
const PARTIAL_ANSWERS = {
    Q1: `def print_pesan(teks):
    print(text)`,  // Typo
    Q2: `def tambah(a, b):
    return a + b + 1`,  // Wrong logic
    Q4: `def luas_persegi_panjang(p, l):
    return p + l`,  // Wrong operation
};

// Student skill distribution (realistic classroom)
const SKILL_DISTRIBUTION = {
    excellent: 0.15,  // 15% get 80-100%
    good: 0.30,       // 30% get 60-80%
    average: 0.35,    // 35% get 40-60%
    struggling: 0.20, // 20% get below 40%
};

function getStudentSkill() {
    const rand = Math.random();
    if (rand < SKILL_DISTRIBUTION.excellent) return 'excellent';
    if (rand < SKILL_DISTRIBUTION.excellent + SKILL_DISTRIBUTION.good) return 'good';
    if (rand < SKILL_DISTRIBUTION.excellent + SKILL_DISTRIBUTION.good + SKILL_DISTRIBUTION.average) return 'average';
    return 'struggling';
}

function generateStudentAnswer(questionId, skill) {
    const correctProb = {
        excellent: 0.85,
        good: 0.65,
        average: 0.45,
        struggling: 0.25,
    };

    const prob = Math.random();

    if (prob < correctProb[skill]) {
        return CORRECT_ANSWERS[questionId] || '';
    } else if (prob < correctProb[skill] + 0.2 && PARTIAL_ANSWERS[questionId]) {
        return PARTIAL_ANSWERS[questionId];
    } else {
        // Return empty or syntax error
        return Math.random() < 0.5 ? '' : 'def wrong():\n    pass';
    }
}

// ============================================================
// MAIN TEST
// ============================================================

export default function () {
    const vuId = __VU;
    const studentName = `Student_${vuId}_${Date.now()}`;
    const skill = getStudentSkill();

    console.log(`[VU ${vuId}] ${studentName} starting exam (skill: ${skill})`);

    // Step 1: Access exam page
    group('Access Exam', function () {
        const examRes = http.get(`${BASE_URL}/exam/${EXAM_ID}`, {
            tags: { name: 'exam_page' }
        });

        check(examRes, {
            'exam page loads': (r) => r.status === 200 || r.status === 304,
        });
    });

    // Simulate reading instructions (5-15 seconds)
    sleep(randomIntBetween(5, 15));

    // Step 2: Work on questions (simulate thinking time)
    const answers = {};
    const questionIds = Object.keys(CORRECT_ANSWERS);

    group('Answer Questions', function () {
        for (const qId of questionIds) {
            // Thinking time: 20-90 seconds per question (realistic)
            const thinkTime = randomIntBetween(20, 90);
            sleep(thinkTime);

            answers[qId] = generateStudentAnswer(qId, skill);
        }
    });

    // Step 3: Review before submit (10-30 seconds)
    sleep(randomIntBetween(10, 30));

    // Step 4: Submit exam
    group('Submit Exam', function () {
        const payload = JSON.stringify({
            examId: EXAM_ID,
            studentName: studentName,
            answers: answers,
            duration: randomIntBetween(15, 45), // 15-45 minutes
        });

        const startTime = Date.now();

        const submitRes = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '120s', // Allow 2 minutes for grading
            tags: { name: 'exam_submit' }
        });

        const gradingTime = Date.now() - startTime;
        examGradingTime.add(gradingTime);
        judge0ResponseTime.add(gradingTime);

        const success = submitRes.status === 200;
        examSubmitSuccess.add(success);

        if (success) {
            try {
                const result = JSON.parse(submitRes.body);
                const score = result.score || result.totalScore || 0;
                examScores.add(score);

                if (score >= 75) {
                    passedStudents.add(1);
                } else {
                    failedStudents.add(1);
                }

                console.log(`[VU ${vuId}] ${studentName} submitted - Score: ${score}, Time: ${gradingTime}ms`);
            } catch (e) {
                console.log(`[VU ${vuId}] Submit OK but parse failed`);
            }
        } else {
            console.log(`[VU ${vuId}] Submit failed: ${submitRes.status} - ${submitRes.body}`);
            failedStudents.add(1);
        }

        check(submitRes, {
            'submit returns 200': (r) => r.status === 200,
            'grading under 60s': () => gradingTime < 60000,
        });
    });

    console.log(`[VU ${vuId}] ${studentName} finished exam`);
}

// ============================================================
// SUMMARY
// ============================================================

export function handleSummary(data) {
    const passed = data.metrics.passed_students ? data.metrics.passed_students.values.count : 0;
    const failed = data.metrics.failed_students ? data.metrics.failed_students.values.count : 0;
    const total = passed + failed;
    const avgScore = data.metrics.exam_scores ? Math.round(data.metrics.exam_scores.values.avg) : 0;
    const avgGradingTime = data.metrics.exam_grading_time ? Math.round(data.metrics.exam_grading_time.values.avg) : 0;
    const p95GradingTime = data.metrics.exam_grading_time ? Math.round(data.metrics.exam_grading_time.values['p(95)']) : 0;
    const successRate = data.metrics.exam_submit_success ? Math.round(data.metrics.exam_submit_success.values.rate * 100) : 0;

    const summary = `
╔══════════════════════════════════════════════════════════════════════╗
║                  ALPRO EXAM LOAD TEST - 100 STUDENTS                 ║
╠══════════════════════════════════════════════════════════════════════╣
║  Total Students: ${String(total).padEnd(10)}                                       ║
║  Passed (≥75):   ${String(passed).padEnd(10)}                                       ║
║  Failed (<75):   ${String(failed).padEnd(10)}                                       ║
║  Pass Rate:      ${String(total > 0 ? Math.round(passed / total * 100) : 0).padEnd(3)}%                                            ║
╠══════════════════════════════════════════════════════════════════════╣
║  Submit Success: ${String(successRate).padEnd(3)}%                                            ║
║  Avg Score:      ${String(avgScore).padEnd(3)}                                              ║
║  Avg Grading:    ${String(avgGradingTime).padEnd(6)}ms                                       ║
║  P95 Grading:    ${String(p95GradingTime).padEnd(6)}ms                                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  HTTP Requests:                                                      ║
║    Total:        ${String(data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0).padEnd(10)}                                    ║
║    Failed:       ${String(data.metrics.http_req_failed ? Math.round(data.metrics.http_req_failed.values.rate * 100) : 0).padEnd(3)}%                                            ║
║    Avg Duration: ${String(data.metrics.http_req_duration ? Math.round(data.metrics.http_req_duration.values.avg) : 0).padEnd(6)}ms                                       ║
╚══════════════════════════════════════════════════════════════════════╝
`;

    console.log(summary);

    return {
        stdout: summary,
        'tests/k6/results/exam_100_students_results.json': JSON.stringify(data, null, 2)
    };
}
