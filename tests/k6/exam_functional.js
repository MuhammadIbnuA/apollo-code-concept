import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const examSubmitDuration = new Trend('exam_submit_duration');
const gradingSuccess = new Rate('grading_success');
const rubricFound = new Rate('rubric_found');

export const options = {
    vus: 1,
    iterations: 1,
    thresholds: {
        http_req_failed: ['rate<0.1'],
    },
};

const BASE_URL = 'http://localhost:3000';

// Test answers
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
print(count)`
};

const PARTIAL_ANSWERS = {
    q1: `total = 30
print(total)`,
    q2: `nilai = 80
if nilai > 75:
    status = "Lulus"
else:
    status = "Tidak Lulus"
print(status)`,
    q3: `count = 0
for i in range(1, 11):
    if i % 2 == 0:
        count += 1
print(count)`
};

export default function () {
    let examId = 'daspro-en';

    // ============================================
    // TEST 1: List Exams
    // ============================================
    group('List Exams', function () {
        const res = http.get(`${BASE_URL}/api/admin/exams`);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'returns array': (r) => Array.isArray(JSON.parse(r.body)),
            'daspro-en exists': (r) => {
                const exams = JSON.parse(r.body);
                return exams.some(e => e.id === 'daspro-en');
            },
        });

        const exams = JSON.parse(res.body);
        const daspro = exams.find(e => e.id === 'daspro-en');
        if (daspro) {
            console.log(`📋 Found exam: ${daspro.title}`);
            console.log(`   Questions: ${daspro.questions.length}`);
        }
    });

    sleep(1);

    // ============================================
    // TEST 2: Submit Correct Answers
    // ============================================
    group('Submit Correct Answers', function () {
        const startTime = Date.now();

        const payload = JSON.stringify({
            examId: examId,
            studentName: `K6_Correct_${Date.now()}`,
            answers: CORRECT_ANSWERS,
            timeTakenSeconds: 120
        });

        const res = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '60s'
        });

        examSubmitDuration.add(Date.now() - startTime);

        const passed = check(res, {
            'status is 200': (r) => r.status === 200,
            'has totalScore': (r) => JSON.parse(r.body).totalScore !== undefined,
            'has gradeDetails': (r) => JSON.parse(r.body).gradeDetails !== undefined,
        });

        gradingSuccess.add(passed);

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n✅ CORRECT ANSWERS RESULT:`);
            console.log(`   Total Score: ${data.totalScore}/${data.totalPoints}`);

            if (data.gradeDetails) {
                rubricFound.add(true);
                for (const [qid, grade] of Object.entries(data.gradeDetails)) {
                    console.log(`   ${qid}: ${grade.score}/${grade.maxScore}`);
                    if (grade.breakdown) {
                        console.log(`      Breakdown: ${JSON.stringify(grade.breakdown)}`);
                    }
                }
            } else {
                rubricFound.add(false);
            }
        } else {
            console.log(`❌ Submit failed: ${res.status}`);
            console.log(res.body);
        }
    });

    sleep(1);

    // ============================================
    // TEST 3: Submit Partial Answers
    // ============================================
    group('Submit Partial Answers', function () {
        const startTime = Date.now();

        const payload = JSON.stringify({
            examId: examId,
            studentName: `K6_Partial_${Date.now()}`,
            answers: PARTIAL_ANSWERS,
            timeTakenSeconds: 90
        });

        const res = http.post(`${BASE_URL}/api/exam/submit`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: '60s'
        });

        examSubmitDuration.add(Date.now() - startTime);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'partial credit given': (r) => {
                const data = JSON.parse(r.body);
                // Score should be less than max (partial)
                return data.totalScore < data.totalPoints && data.totalScore > 0;
            },
        });

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n⚠️ PARTIAL ANSWERS RESULT:`);
            console.log(`   Total Score: ${data.totalScore}/${data.totalPoints} (partial)`);

            if (data.gradeDetails) {
                for (const [qid, grade] of Object.entries(data.gradeDetails)) {
                    const isPartial = grade.score > 0 && grade.score < grade.maxScore;
                    const status = isPartial ? '⚠️' : (grade.score === grade.maxScore ? '✅' : '❌');
                    console.log(`   ${status} ${qid}: ${grade.score}/${grade.maxScore}`);
                    if (grade.errors && grade.errors.length > 0) {
                        console.log(`      Errors: ${grade.errors.slice(0, 2).join(', ')}`);
                    }
                }
            }
        }
    });

    sleep(1);

    // ============================================
    // TEST 4: Check Analytics
    // ============================================
    group('Check Analytics', function () {
        const res = http.get(`${BASE_URL}/api/teacher/analytics?examId=${examId}`);

        check(res, {
            'status is 200': (r) => r.status === 200,
            'has submissions': (r) => {
                const data = JSON.parse(r.body);
                return data.submissions && data.submissions.length > 0;
            },
        });

        if (res.status === 200) {
            const data = JSON.parse(res.body);
            console.log(`\n📊 ANALYTICS:`);
            console.log(`   Total Submissions: ${data.submissions?.length || 0}`);
            console.log(`   Pass Rate: ${data.passRate || 'N/A'}%`);
            console.log(`   Avg Score: ${data.averageScore || 'N/A'}`);
        }
    });

    console.log('\n🏁 K6 FUNCTIONAL TESTS COMPLETE');
}
