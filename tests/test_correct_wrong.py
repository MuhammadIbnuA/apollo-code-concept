"""
Comprehensive Test: Correct vs Wrong Answer Validation
Tests that the grading system correctly distinguishes right/wrong answers
"""
import requests
import json
import time

BASE_URL = "http://localhost:3000"

def get_exam():
    """Fetch daspro-en exam"""
    res = requests.get(f"{BASE_URL}/api/admin/exams")
    exams = res.json()
    return next((e for e in exams if e.get("id") == "daspro-en"), None)

def submit_and_check(exam, answers, expected_description):
    """Submit answers and check results"""
    payload = {
        "examId": exam['id'],
        "studentName": f"Test_{int(time.time())}",
        "answers": answers,
        "timeTakenSeconds": 120
    }
    
    res = requests.post(
        f"{BASE_URL}/api/exam/submit",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=60
    )
    
    data = res.json()
    return data

def run_tests():
    print("=" * 70)
    print("🧪 COMPREHENSIVE TEST: Correct vs Wrong Answer Validation")
    print("=" * 70)
    
    exam = get_exam()
    if not exam:
        print("❌ daspro-en exam not found!")
        return
    
    print(f"📋 Exam: {exam['title']}")
    print(f"   Total Points: {sum(q['points'] for q in exam['questions'])}")
    
    # Get actual question IDs
    q_ids = [q['id'] for q in exam['questions']]
    print(f"   Question IDs: {q_ids}")
    
    # ================================================
    # TEST 1: All Correct Answers
    # ================================================
    print("\n" + "-" * 70)
    print("TEST 1: All Correct Answers (Expected: Full Score)")
    print("-" * 70)
    
    correct_answers = {}
    for q in exam['questions']:
        qid = q['id']
        if 'genap' in q.get('title', '').lower() or 'even' in q.get('description', '').lower():
            correct_answers[qid] = """total = 0
for i in range(1, 11):
    if i % 2 == 0:
        total += i
print(total)"""
        elif 'lulus' in q.get('title', '').lower() or 'status' in q.get('description', '').lower():
            correct_answers[qid] = """nilai = 80
if nilai >= 75:
    status = "Lulus"
else:
    status = "Tidak Lulus"
print(status)"""
        elif 'ganjil' in q.get('title', '').lower() or 'odd' in q.get('description', '').lower():
            correct_answers[qid] = """count = 0
for i in range(1, 11):
    if i % 2 != 0:
        count += 1
print(count)"""
        else:
            # Generic correct answer
            correct_answers[qid] = """total = 30
for i in range(1, 11):
    if i % 2 == 0:
        total += i
print(total)"""
    
    result = submit_and_check(exam, correct_answers, "All Correct")
    total = result.get('totalScore', 0)
    max_total = result.get('totalPoints', 30)
    passed = result.get('passed', False)
    
    print(f"   Result: {total}/{max_total} (passed: {passed})")
    if result.get('gradeDetails'):
        for qid, grade in result['gradeDetails'].items():
            status = "✅" if grade['score'] == grade['maxScore'] else "⚠️"
            print(f"   {status} {qid}: {grade['score']}/{grade['maxScore']}")
    
    test1_pass = total == max_total
    print(f"   {'✅ TEST PASSED' if test1_pass else '❌ TEST FAILED'}: Expected full score")
    
    # ================================================
    # TEST 2: All Wrong Answers
    # ================================================
    print("\n" + "-" * 70)
    print("TEST 2: All Wrong Answers (Expected: Low/Zero Score)")
    print("-" * 70)
    
    wrong_answers = {}
    for qid in q_ids:
        wrong_answers[qid] = """# Completely wrong answer
x = "hello"
print(x)"""
    
    result = submit_and_check(exam, wrong_answers, "All Wrong")
    total = result.get('totalScore', 0)
    max_total = result.get('totalPoints', 30)
    
    print(f"   Result: {total}/{max_total}")
    if result.get('gradeDetails'):
        for qid, grade in result['gradeDetails'].items():
            status = "✅" if grade['score'] == 0 else "⚠️"
            print(f"   {status} {qid}: {grade['score']}/{grade['maxScore']}")
            if grade.get('errors'):
                print(f"      Errors: {grade['errors'][:2]}")
    
    test2_pass = total < max_total / 2  # Should be less than half
    print(f"   {'✅ TEST PASSED' if test2_pass else '❌ TEST FAILED'}: Expected low score")
    
    # ================================================
    # TEST 3: Mixed (1 Correct, 2 Wrong)
    # ================================================
    print("\n" + "-" * 70)
    print("TEST 3: Mixed Answers (1 Correct, 2 Wrong)")
    print("-" * 70)
    
    mixed_answers = {}
    for i, qid in enumerate(q_ids):
        if i == 0:
            # First question: correct
            mixed_answers[qid] = correct_answers.get(qid, "total = 30\nprint(total)")
        else:
            # Others: wrong
            mixed_answers[qid] = "x = 999\nprint(x)"
    
    result = submit_and_check(exam, mixed_answers, "Mixed")
    total = result.get('totalScore', 0)
    max_total = result.get('totalPoints', 30)
    
    print(f"   Result: {total}/{max_total}")
    if result.get('gradeDetails'):
        for qid, grade in result['gradeDetails'].items():
            status = "✅" if grade['score'] > 0 else "❌"
            print(f"   {status} {qid}: {grade['score']}/{grade['maxScore']}")
    
    # Should have some points but not all
    test3_pass = 0 < total < max_total
    print(f"   {'✅ TEST PASSED' if test3_pass else '❌ TEST FAILED'}: Expected partial score")
    
    # ================================================
    # TEST 4: Partial Credit (Wrong but has structure)
    # ================================================
    print("\n" + "-" * 70)
    print("TEST 4: Partial Credit (Has structure, wrong result)")
    print("-" * 70)
    
    partial_answers = {}
    for qid in q_ids:
        # Has loop and condition but wrong logic
        partial_answers[qid] = """total = 0
for i in range(1, 11):
    if i % 2 == 1:  # Wrong: counting odd instead of even
        total += i
print(total)"""
    
    result = submit_and_check(exam, partial_answers, "Partial")
    total = result.get('totalScore', 0)
    max_total = result.get('totalPoints', 30)
    
    print(f"   Result: {total}/{max_total}")
    if result.get('gradeDetails'):
        for qid, grade in result['gradeDetails'].items():
            # Partial should have some points
            is_partial = 0 < grade['score'] < grade['maxScore']
            status = "⚠️" if is_partial else ("✅" if grade['score'] > 0 else "❌")
            print(f"   {status} {qid}: {grade['score']}/{grade['maxScore']} {'(partial)' if is_partial else ''}")
            if grade.get('breakdown'):
                print(f"      Breakdown: {grade['breakdown']}")
    
    test4_pass = 0 < total < max_total
    print(f"   {'✅ TEST PASSED' if test4_pass else '❌ TEST FAILED'}: Expected partial credit")
    
    # ================================================
    # SUMMARY
    # ================================================
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    all_tests = [
        ("All Correct → Full Score", test1_pass),
        ("All Wrong → Low Score", test2_pass),
        ("Mixed → Partial Score", test3_pass),
        ("Partial Credit", test4_pass),
    ]
    
    for name, passed in all_tests:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"   {name}: {status}")
    
    all_passed = all(p for _, p in all_tests)
    print("\n" + "=" * 70)
    if all_passed:
        print("🎉 ALL TESTS PASSED! Grading system correctly distinguishes answers.")
    else:
        print("⚠️ SOME TESTS FAILED - Check grading logic")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
