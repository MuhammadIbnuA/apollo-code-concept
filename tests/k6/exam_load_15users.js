/**
 * K6 Load Test: Exam Simulation (Configurable)
 * Simulates students taking alpro-functions exam simultaneously
 * 
 * Usage:
 *   k6 run tests/k6/exam_load_15users.js
 *   k6 run tests/k6/exam_load_15users.js -e VUS=30 -e EXAM_ID=alpro-functions
 *   k6 run tests/k6/exam_load_15users.js -e VUS=15 -e BASE_URL=http://localhost:4000
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ============================================================
// CONFIGURATION (All configurable via environment)
// ============================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const EXAM_ID = __ENV.EXAM_ID || 'alpro-functions';
const VUS = parseInt(__ENV.VUS || '30');
const THINK_TIME = parseInt(__ENV.THINK_TIME || '3'); // seconds per question

export const options = {
    scenarios: {
        exam_session: {
            executor: 'shared-iterations',
            vus: VUS,
            iterations: VUS,
            maxDuration: '10m',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.1'],
        http_req_duration: ['p(95)<60000'],
        exam_submit_success: ['rate>0.8'],
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

// Judge0 specific metrics (per question grading)
const judge0ResponseTime = new Trend('judge0_response_time', true);
const judge0PerQuestion = new Trend('judge0_per_question', true);

// ============================================================
// CORRECT ANSWERS FOR ALPRO-FUNCTIONS EXAM (10 Questions)
// ============================================================

const CORRECT_ANSWERS = {
    // Q1: Fungsi print_pesan(teks)
    Q1: `def print_pesan(teks):
    print(teks)`,

    // Q2: Fungsi tambah(a, b)
    Q2: `def tambah(a, b):
    return a + b`,

    // Q3: Pemanggilan Fungsi
    Q3: `def tambah(a, b):
    return a + b

hasil = tambah(10, 20)
print(hasil)`,

    // Q4: Fungsi luas_persegi_panjang(p, l)
    Q4: `def luas_persegi_panjang(p, l):
    return p * l`,

    // Q5: Fungsi luas_lingkaran(r)
    Q5: `def luas_lingkaran(r):
    return 3.14 * r * r`,

    // Q6: Fungsi nilai_minimum(daftar)
    Q6: `def nilai_minimum(daftar):
    minimum = daftar[0]
    for angka in daftar:
        if angka < minimum:
            minimum = angka
    return minimum`,

    // Q7: Fungsi rata_rata(daftar)
    Q7: `def rata_rata(daftar):
    total = 0
    for angka in daftar:
        total += angka
    return total / len(daftar)`,

    // Q8: Fungsi status_kelulusan(nilai)
    Q8: `def status_kelulusan(nilai):
    if nilai >= 75:
        return "Lulus"
    else:
        return "Tidak Lulus"`,

    // Q9: Fungsi tampilkan_identitas()
    Q9: `def tampilkan_identitas():
    print("Nama: Budi Santoso")
    print("NIM: 12345678")`,

    // Q10: Fungsi hitung_luas_dan_tampilkan(p, l)
    Q10: `def hitung_luas_dan_tampilkan(p, l):
    luas = p * l
    print(luas)`
};

// Partial answers (missing some criteria)
const PARTIAL_ANSWERS = {
    Q1: `def print_pesan(teks):
    pass`,  // Missing print
    Q2: `def tambah(a, b):
    a + b`,  // Missing return
    Q3: `def tambah(a, b):
    return a + b
tambah(10, 20)`,  // Missing assignment
    Q4: `def luas_persegi_panjang(p, l):
    return p + l`,  // Wrong operation
    Q5: `def luas_lingkaran(r):
    3.14 * r * r`,  // Missing return
    Q6: `def nilai_minimum(daftar):
    return min(daftar)`,  // Using built-in (no loop)
    Q7: `def rata_rata(daftar):
    return sum(daftar)`,  // Missing len
    Q8: `def status_kelulusan(nilai):
    print("Lulus")`,  // Missing if and return
    Q9: `def tampilkan_identitas():
    pass`,  // Missing print
    Q10: `def hitung_luas_dan_tampilkan(p, l):
    print(p)`  // Wrong calculation
};

// Wrong answers
const WRONG_ANSWERS = {
    Q1: `print("Hello")`,
    Q2: `x = 5`,
    Q3: `print(30)`,
    Q4: `print("luas")`,
    Q5: `print(3.14)`,
    Q6: `print([1,2,3])`,
    Q7: `print(0)`,
    Q8: `print("test")`,
    Q9: `print("hello")`,
    Q10: `print(0)`
};

// ============================================================
// STUDENT SKILL DISTRIBUTION
// ============================================================

const SKILL_LEVELS = {
    'excellent': { correct: 1.0, partial: 0.0, wrong: 0.0 },
    'good': { correct: 0.7, partial: 0.2, wrong: 0.1 },
    'average': { correct: 0.4, partial: 0.4, wrong: 0.2 },
    'struggling': { correct: 0.2, partial: 0.3, wrong: 0.5 },
};

function getSkillLevel(vuId) {
    const distribution = [
        'excellent', 'excellent',
        'good', 'good', 'good', 'good',
        'average', 'average', 'average', 'average', 'average',
        'struggling', 'struggling', 'struggling', 'struggling'
    ];
    return distribution[(vuId - 1) % distribution.length] || 'average';
}

// Indonesian names
const STUDENT_NAMES = [
    'Andi Pratama', 'Budi Santoso', 'Citra Dewi', 'Dimas Wijaya', 'Eka Putri',
    'Faisal Rahman', 'Gita Sari', 'Hendra Kusuma', 'Indah Lestari', 'Joko Widodo',
    'Kartika Maya', 'Lukman Hakim', 'Maya Anggraini', 'Naufal Rizki', 'Olivia Tan',
    'Putra Satria', 'Qori Amelia', 'Rizky Maulana', 'Sinta Dewi', 'Taufik Hidayat',
    'Ulfa Rahmawati', 'Vino Bastian', 'Wulan Sari', 'Xena Putri', 'Yusuf Ahmad',
    'Zahra Ayu', 'Ahmad Fauzi', 'Bella Rosa', 'Chandra Kumar', 'Dewi Pertiwi'
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAnswerForQuestion(qId, skillLevel) {
    const level = SKILL_LEVELS[skillLevel];
    const rand = Math.random();

    if (rand < level.correct) {
        return CORRECT_ANSWERS[qId] || `print("answer for ${qId}")`;
    } else if (rand < level.correct + level.partial) {
        return PARTIAL_ANSWERS[qId] || `# partial answer for ${qId}`;
    } else {
        return WRONG_ANSWERS[qId] || `print("wrong")`;
    }
}

// ============================================================
// MAIN TEST SCENARIO
// ============================================================

export default function () {
    const vuId = __VU;
    const studentName = STUDENT_NAMES[(vuId - 1) % STUDENT_NAMES.length] + `_${vuId}`;
    const skillLevel = getSkillLevel(vuId);

    console.log(`\n🎓 [VU ${vuId}] ${studentName} starting exam (skill: ${skillLevel})`);

    // ========================================
    // PHASE 1: Load Exam & Get Question IDs
    // ========================================
    let questionIds = [];

    group('Load Exam', function () {
        const examRes = http.get(`${BASE_URL}/api/exam/${EXAM_ID}`);

        const examLoaded = check(examRes, {
            'exam loaded': (r) => r.status === 200,
        });

        if (!examLoaded) {
            console.log(`❌ [VU ${vuId}] Failed to load exam: ${examRes.status}`);
            console.log(examRes.body);
            return;
        }

        const exam = JSON.parse(examRes.body);
        questionIds = exam.questions.map(q => q.id);
        console.log(`📋 [VU ${vuId}] Loaded: ${exam.title} (${questionIds.length} questions)`);
    });

    if (questionIds.length === 0) {
        console.log(`❌ [VU ${vuId}] No questions found, skipping`);
        return;
    }

    // Simulate reading instructions
    sleep(randomIntBetween(1, 3));

    // ========================================
    // PHASE 2: Answer Questions
    // ========================================
    const answers = {};
    let totalThinkingTime = 0;

    group('Answer Questions', function () {
        for (const qId of questionIds) {
            // Simulate thinking time
            const thinkTime = randomIntBetween(THINK_TIME, THINK_TIME * 2);
            totalThinkingTime += thinkTime;

            // Simulate answering
            sleep(thinkTime);
            answers[qId] = getAnswerForQuestion(qId, skillLevel);
        }
        console.log(`💭 [VU ${vuId}] Completed ${questionIds.length} questions in ${totalThinkingTime}s`);
    });

    // ========================================
    // PHASE 3: Submit Exam
    // ========================================
    group('Submit Exam', function () {
        const submitStartTime = Date.now();

        const payload = JSON.stringify({
            examId: EXAM_ID,
            studentName: studentName,
            answers: answers,
            timeTakenSeconds: totalThinkingTime
        });

        const submitRes = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '180s'  // 3 minutes for grading
        });

        const gradingTime = Date.now() - submitStartTime;
        examGradingTime.add(gradingTime);

        const success = check(submitRes, {
            'submit success': (r) => r.status === 200,
            'has score': (r) => {
                try { return JSON.parse(r.body).totalScore !== undefined; }
                catch { return false; }
            }
        });

        examSubmitSuccess.add(success ? 1 : 0);

        if (submitRes.status === 200) {
            const result = JSON.parse(submitRes.body);
            const score = result.totalScore;
            const maxScore = result.totalPoints;
            const passed = result.passed;
            const percentage = ((score / maxScore) * 100).toFixed(1);
            const numQuestions = Object.keys(result.gradeDetails || {}).length;

            examScores.add(score);

            // Track Judge0 time per exam and per question
            judge0ResponseTime.add(gradingTime);
            if (numQuestions > 0) {
                const perQuestionTime = gradingTime / numQuestions;
                judge0PerQuestion.add(perQuestionTime);
            }

            if (passed) {
                passedStudents.add(1);
            } else {
                failedStudents.add(1);
            }

            const status = passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`\n📊 [VU ${vuId}] ${studentName} ${status}`);
            console.log(`   Score: ${score}/${maxScore} (${percentage}%)`);
            console.log(`   Total Grading: ${(gradingTime / 1000).toFixed(1)}s | Per Q: ${((gradingTime / numQuestions) / 1000).toFixed(2)}s`);

            // Show per-question breakdown
            if (result.gradeDetails) {
                let breakdown = '   ';
                for (const [qId, grade] of Object.entries(result.gradeDetails)) {
                    const icon = grade.score === grade.maxScore ? '✅' :
                        grade.score > 0 ? '⚠️' : '❌';
                    breakdown += `${qId}:${icon} `;
                }
                console.log(breakdown);
            }
        } else {
            console.log(`❌ [VU ${vuId}] SUBMIT FAILED: ${submitRes.status}`);
        }
    });

    sleep(1);
}

// ============================================================
// SUMMARY
// ============================================================

export function handleSummary(data) {
    const passed = data.metrics.passed_students?.values.count || 0;
    const failed = data.metrics.failed_students?.values.count || 0;
    const total = passed + failed;
    const avgScore = data.metrics.exam_scores?.values.avg || 0;
    const avgGradingTime = data.metrics.exam_grading_time?.values.avg || 0;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    // Judge0 metrics
    const j0Avg = data.metrics.judge0_response_time?.values.avg || 0;
    const j0Min = data.metrics.judge0_response_time?.values.min || 0;
    const j0Max = data.metrics.judge0_response_time?.values.max || 0;
    const j0P95 = data.metrics.judge0_response_time?.values['p(95)'] || 0;
    const j0PerQ = data.metrics.judge0_per_question?.values.avg || 0;

    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║           📊 EXAM SIMULATION RESULTS                         ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Exam ID:             ${EXAM_ID.padEnd(40)}║`);
    console.log(`║  Total Students:      ${total.toString().padEnd(40)}║`);
    console.log(`║  Passed:              ${passed.toString().padEnd(40)}║`);
    console.log(`║  Failed:              ${failed.toString().padEnd(40)}║`);
    console.log(`║  Pass Rate:           ${passRate}%`.padEnd(65) + '║');
    console.log(`║  Average Score:       ${avgScore.toFixed(1)}`.padEnd(65) + '║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║           ⚡ JUDGE0 API PERFORMANCE                          ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Avg Response Time:   ${(j0Avg / 1000).toFixed(2)}s`.padEnd(65) + '║');
    console.log(`║  Min Response Time:   ${(j0Min / 1000).toFixed(2)}s`.padEnd(65) + '║');
    console.log(`║  Max Response Time:   ${(j0Max / 1000).toFixed(2)}s`.padEnd(65) + '║');
    console.log(`║  P95 Response Time:   ${(j0P95 / 1000).toFixed(2)}s`.padEnd(65) + '║');
    console.log(`║  Avg Per Question:    ${(j0PerQ / 1000).toFixed(2)}s`.padEnd(65) + '║');
    console.log('╚══════════════════════════════════════════════════════════════╝');

    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
