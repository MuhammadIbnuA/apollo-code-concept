
import http from 'k6/http';
import { check, group } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus: 1,
    iterations: 1, // Single run for functional verification
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    const examId = `functional-test-${randomString(6)}`;
    const studentName = "TestStudent_Verified";
    const expectedScore = 85;
    const expectedAnswers = {
        "q1": "print('Test')",
        "q2": "return verified"
    };

    group('1. Admin: Create Exam', function () {
        const payload = JSON.stringify({
            id: examId,
            title: "Functional Verification Exam",
            description: "Exam to verify data persistence",
            durationMinutes: 30,
            isPublic: true,
            questions: [
                { id: "q1", title: "Q1", description: "D1", initialCode: "", validationCode: "", points: 50 },
                { id: "q2", title: "Q2", description: "D2", initialCode: "", validationCode: "", points: 50 }
            ],
            createdAt: new Date().toISOString()
        });

        const res = http.post(`${BASE_URL}/api/admin/exams`, payload, { headers: { 'Content-Type': 'application/json' } });

        check(res, {
            'Exam Created (200)': (r) => r.status === 200,
            'Exam ID matches': (r) => r.json('id') === examId
        });
    });

    group('2. Student: Submit Answers', function () {
        const payload = JSON.stringify({
            examId: examId,
            studentName: studentName,
            score: expectedScore,
            answers: expectedAnswers
        });

        const res = http.post(`${BASE_URL}/api/exam/submit`, payload, { headers: { 'Content-Type': 'application/json' } });

        check(res, {
            'Submission Successful (200)': (r) => r.status === 200,
            'Data Returned': (r) => r.json('data') !== undefined,
            'Score Saved Correctly': (r) => r.json('data.score') === expectedScore,
            'Student Name Saved': (r) => r.json('data.studentName') === studentName,
            'Answers Saved Correctly': (r) => JSON.stringify(r.json('data.answers')) === JSON.stringify(expectedAnswers)
        });

        if (res.status === 200) {
            console.log(`✅ Verified: Score ${res.json('data.score')} saved for ${res.json('data.studentName')}`);
        } else {
            console.error(`❌ Failed: Status ${res.status}`);
            console.error(`Response Body: ${res.body}`);
        }
    });
}
