import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const submitDuration = new Trend('submit_duration_ms');
const gradingSuccess = new Rate('grading_success_rate');

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_failed: ['rate<0.1'],
    },
};

const BASE_URL = 'https://apollo-code-concept.vercel.app';

// ============================================================
// ANSWER TEMPLATES
// ============================================================

const CORRECT_ANSWERS = {
    q1: `total = 0
for i in range(1, 11):
    if i % 2 == 0:
        total += i
print(total)`,
    q2: `nilai = 80
if nilai >= 75:
    status = "Lulus"
else:
    status = "Tidak Lulus"
print(status)`,
    q3: `count = 0
for i in range(1, 11):
    if i % 2 != 0:
        count += 1
print(count)`,
    Q1: `def print_pesan(teks):
    print(teks)
print_pesan("Hello")`,
    Q2: `def tambah(a, b):
    return a + b`,
    Q3: `def tambah(a, b):
    return a + b
hasil = tambah(10, 20)`,
    Q4: `def luas_persegi_panjang(p, l):
    return p * l`,
    Q5: `def luas_lingkaran(r):
    return 3.14 * r * r`,
    Q6: `def nilai_minimum(daftar):
    m = daftar[0]
    for x in daftar:
        if x < m:
            m = x
    return m`,
    Q7: `def rata_rata(daftar):
    t = 0
    for x in daftar:
        t += x
    return t / len(daftar)`,
    Q8: `def status_kelulusan(nilai):
    if nilai >= 75:
        return "Lulus"
    return "Tidak Lulus"`,
    Q9: `def tampilkan_identitas():
    print("Nama: Test")
    print("NIM: 123")`,
    Q10: `def hitung_luas_dan_tampilkan(p, l):
    print(p * l)`
};

const WRONG_ANSWERS = {
    q1: "x = 999",
    q2: "x = 'wrong'",
    q3: "count = 0",
    Q1: "x = 1",
    Q2: "x = 2",
    Q3: "x = 3",
    Q4: "x = 4",
    Q5: "x = 5",
    Q6: "x = 6",
    Q7: "x = 7",
    Q8: "x = 8",
    Q9: "x = 9",
    Q10: "x = 10"
};

// ============================================================
// MAIN TEST
// ============================================================

export default function () {
    let exams = [];

    // ========================================
    // TEST 1: List Exams
    // ========================================
    group('1. List Exams', function () {
        const res = http.get(`${BASE_URL}/api/admin/exams`);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'returns array': (r) => Array.isArray(JSON.parse(r.body)),
        });

        if (res.status === 200) {
            exams = JSON.parse(res.body);
            console.log(`📋 Found ${exams.length} exams`);
            exams.forEach(e => console.log(`   - ${e.id}: ${e.title}`));
        }
    });

    sleep(1);

    // Find test exam
    let testExam = exams.find(e => e.id === 'daspro-en' || e.id === 'alpro-functions');
    if (!testExam && exams.length > 0) {
        testExam = exams[0];
    }

    if (!testExam) {
        console.log('❌ No exam found to test');
        return;
    }

    console.log(`\n🎯 Testing exam: ${testExam.id}`);

    // ========================================
    // TEST 2: Submit Correct Answers
    // ========================================
    group('2. Submit Correct Answers', function () {
        const answers = {};
        testExam.questions.forEach(q => {
            answers[q.id] = CORRECT_ANSWERS[q.id] || "print('ok')";
        });

        const payload = JSON.stringify({
            examId: testExam.id,
            studentName: `K6_Correct_${Date.now()}`,
            answers: answers,
            timeTakenSeconds: 120
        });

        const start = Date.now();
        const res = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '120s'
        });
        submitDuration.add(Date.now() - start);

        const passed = check(res, {
            'status is 200': (r) => r.status === 200,
            'has totalScore': (r) => JSON.parse(r.body).totalScore !== undefined,
            'has gradeDetails': (r) => JSON.parse(r.body).gradeDetails !== undefined,
        });

        gradingSuccess.add(passed);

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n✅ CORRECT ANSWERS: ${data.totalScore}/${data.totalPoints}`);

            check(res, {
                'high score (>70%)': (r) => {
                    const d = JSON.parse(r.body);
                    return d.totalScore > d.totalPoints * 0.7;
                }
            });
        }
    });

    sleep(2);

    // ========================================
    // TEST 3: Submit Wrong Answers
    // ========================================
    group('3. Submit Wrong Answers', function () {
        const answers = {};
        testExam.questions.forEach(q => {
            answers[q.id] = WRONG_ANSWERS[q.id] || "x = 0";
        });

        const payload = JSON.stringify({
            examId: testExam.id,
            studentName: `K6_Wrong_${Date.now()}`,
            answers: answers,
            timeTakenSeconds: 60
        });

        const start = Date.now();
        const res = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '120s'
        });
        submitDuration.add(Date.now() - start);

        check(res, {
            'status is 200': (r) => r.status === 200,
        });

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n❌ WRONG ANSWERS: ${data.totalScore}/${data.totalPoints}`);

            check(res, {
                'low score (<30%)': (r) => {
                    const d = JSON.parse(r.body);
                    return d.totalScore < d.totalPoints * 0.3;
                }
            });
        }
    });

    sleep(2);

    // ========================================
    // TEST 4: Submit Mixed Answers
    // ========================================
    group('4. Submit Mixed Answers', function () {
        const answers = {};
        testExam.questions.forEach((q, i) => {
            // Alternate correct/wrong
            if (i % 2 === 0) {
                answers[q.id] = CORRECT_ANSWERS[q.id] || "print('ok')";
            } else {
                answers[q.id] = WRONG_ANSWERS[q.id] || "x = 0";
            }
        });

        const payload = JSON.stringify({
            examId: testExam.id,
            studentName: `K6_Mixed_${Date.now()}`,
            answers: answers,
            timeTakenSeconds: 90
        });

        const start = Date.now();
        const res = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '120s'
        });
        submitDuration.add(Date.now() - start);

        check(res, {
            'status is 200': (r) => r.status === 200,
        });

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n⚠️ MIXED ANSWERS: ${data.totalScore}/${data.totalPoints}`);

            check(res, {
                'partial score (between 0 and max)': (r) => {
                    const d = JSON.parse(r.body);
                    return d.totalScore > 0 && d.totalScore < d.totalPoints;
                }
            });
        }
    });

    sleep(2);

    // ========================================
    // TEST 5: Analytics API
    // ========================================
    group('5. Analytics API', function () {
        const res = http.get(`${BASE_URL}/api/teacher/analytics?examId=${testExam.id}`);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'has submissions': (r) => {
                const data = JSON.parse(r.body);
                return data.submissions && data.submissions.length > 0;
            }
        });

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n📊 ANALYTICS: ${data.submissions?.length || 0} submissions`);
        }
    });

    console.log('\n🏁 K6 PRODUCTION TESTS COMPLETE');
}
