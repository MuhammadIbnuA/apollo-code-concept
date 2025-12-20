
import { db, Exam } from '../src/lib/db';

async function main() {
    console.log("Starting Analytics Verification...");

    const examId = "test-analytics-exam-" + Date.now();

    // 1. Create Dummy Exam
    console.log("1. Creating Exam...");
    await db.saveExam({
        id: examId,
        title: "Analytics Test Exam",
        description: "Test",
        durationMinutes: 60,
        questions: [
            { id: "q1", title: "Q1", description: "D", initialCode: "", validationCode: "", points: 50 },
            { id: "q2", title: "Q2", description: "D", initialCode: "", validationCode: "", points: 50 }
        ],
        isPublic: false,
        createdAt: new Date().toISOString()
    });

    // 2. Submit Attempts
    console.log("2. Submitting Attempts...");

    // Student A: Pass (100/100) in 10 mins
    await db.submitExamAttempt({
        examId,
        studentName: "Student A",
        score: 100,
        answers: { q1: "A", q2: "B" },
        timeTakenSeconds: 600,
        timestamp: new Date().toISOString()
    });

    // Student B: Fail (40/100) first, then Pass (80/100)
    // Attempt 1
    await db.submitExamAttempt({
        examId,
        studentName: "Student B",
        score: 40,
        answers: { q1: "Wrong", q2: "Wrong" },
        timeTakenSeconds: 300,
        timestamp: new Date(Date.now() - 10000).toISOString() // 10 sec ago
    });

    // Attempt 2 (Pass)
    await db.submitExamAttempt({
        examId,
        studentName: "Student B",
        score: 80,
        answers: { q1: "A", q2: "Partial" },
        timeTakenSeconds: 900, // 15 mins
        timestamp: new Date().toISOString()
    });

    // Student C: Fail (0/100)
    await db.submitExamAttempt({
        examId,
        studentName: "Student C",
        score: 0,
        answers: {},
        timeTakenSeconds: 120, // 2 mins
        timestamp: new Date().toISOString()
    });

    // 3. Verify Analytics
    console.log("3. Fetching Analytics...");
    const analytics = await db.getExamAnalytics(examId);

    console.log("--- Results ---");
    console.log("Total Submissions:", analytics.submissions.length);
    console.log("Completion (Unique):", analytics.completionRate);
    console.log("Pass Rate (%):", analytics.passRate);
    console.log("Avg Score:", analytics.averageScore);
    console.log("Avg Time (Success):", analytics.averageTime);
    console.log("First Attempt Success (%):", analytics.firstAttemptSuccess);

    // Assertions
    // Total Unique Students: 3 (A, B, C)
    // Passing: A (100), B (80). C (0). Pass Rate = 2/3 = 66.6%
    // First Attempt Pass: A (Yes), B (No - 40), C (No - 0). Rate = 1/3 = 33.3%
    // Avg Score (Best): (100 + 80 + 0) / 3 = 60
    // Avg Time (Success): (600 + 900) / 2 = 750

    if (analytics.completionRate !== "3") throw new Error("Completion Rate incorrect");
    if (Math.abs(analytics.passRate - 66.66) > 1) throw new Error("Pass Rate incorrect");
    if (Math.abs(analytics.firstAttemptSuccess - 33.33) > 1) throw new Error("First Attempt Success incorrect");
    if (analytics.averageScore !== 60) throw new Error("Avg Score incorrect");
    if (analytics.averageTime !== 750) throw new Error("Avg Time incorrect");

    console.log("✅ VERIFICATION SUCCESSFUL!");
}

main().catch(console.error);
