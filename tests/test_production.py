"""
Production Test Suite for Apollo Code Concept
Target: https://apollo-code-concept.vercel.app/

Tests:
1. All correct answers
2. All wrong answers
3. Mixed answers (combination)
4. Full functionality test
"""

import requests
import json
import time
from typing import Dict, Any, List

BASE_URL = "https://apollo-code-concept.vercel.app"

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def api_get(endpoint: str) -> Dict:
    response = requests.get(f"{BASE_URL}{endpoint}", timeout=30)
    return {"status": response.status_code, "data": response.json() if response.status_code == 200 else None}

def api_post(endpoint: str, data: Dict) -> Dict:
    response = requests.post(
        f"{BASE_URL}{endpoint}",
        json=data,
        headers={"Content-Type": "application/json"},
        timeout=120
    )
    try:
        return {"status": response.status_code, "data": response.json()}
    except:
        return {"status": response.status_code, "data": response.text}

def print_test(name: str, passed: bool, details: str = ""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"  {status} | {name}")
    if details and not passed:
        print(f"         └─ {details}")

def get_exam(exam_id: str) -> Dict:
    """Fetch exam by ID"""
    result = api_get("/api/admin/exams")
    if result["status"] == 200 and result["data"]:
        for exam in result["data"]:
            if exam.get("id") == exam_id:
                return exam
    return None

# ============================================================
# CORRECT ANSWERS
# ============================================================

CORRECT_ANSWERS = {
    # For daspro-en exam
    "q1": """total = 0
for i in range(1, 11):
    if i % 2 == 0:
        total += i
print(total)""",
    
    "q2": """nilai = 80
if nilai >= 75:
    status = "Lulus"
else:
    status = "Tidak Lulus"
print(status)""",
    
    "q3": """count = 0
for i in range(1, 11):
    if i % 2 != 0:
        count += 1
print(count)""",
    
    # For alpro-functions exam
    "Q1": """def print_pesan(teks):
    print(teks)
print_pesan("Hello")""",
    
    "Q2": """def tambah(a, b):
    return a + b
print(tambah(3, 5))""",
    
    "Q3": """def tambah(a, b):
    return a + b
hasil = tambah(10, 20)
print(hasil)""",
    
    "Q4": """def luas_persegi_panjang(p, l):
    return p * l
print(luas_persegi_panjang(5, 3))""",
    
    "Q5": """def luas_lingkaran(r):
    return 3.14 * r * r
print(luas_lingkaran(7))""",
    
    "Q6": """def nilai_minimum(daftar):
    minimum = daftar[0]
    for x in daftar:
        if x < minimum:
            minimum = x
    return minimum
print(nilai_minimum([5, 2, 8, 1]))""",
    
    "Q7": """def rata_rata(daftar):
    total = 0
    for x in daftar:
        total += x
    return total / len(daftar)
print(rata_rata([10, 20, 30]))""",
    
    "Q8": """def status_kelulusan(nilai):
    if nilai >= 75:
        return "Lulus"
    else:
        return "Tidak Lulus"
print(status_kelulusan(80))""",
    
    "Q9": """def tampilkan_identitas():
    print("Nama: Test User")
    print("NIM: 12345678")
tampilkan_identitas()""",
    
    "Q10": """def hitung_luas_dan_tampilkan(p, l):
    luas = p * l
    print(luas)
hitung_luas_dan_tampilkan(4, 5)"""
}

WRONG_ANSWERS = {
    "q1": "x = 999",
    "q2": "x = 'hello'",
    "q3": "count = 100",
    "Q1": "x = 1",
    "Q2": "y = 2",
    "Q3": "z = 3",
    "Q4": "a = 4",
    "Q5": "b = 5",
    "Q6": "c = 6",
    "Q7": "d = 7",
    "Q8": "e = 8",
    "Q9": "f = 9",
    "Q10": "g = 10"
}

# ============================================================
# TEST 1: LIST EXAMS
# ============================================================

def test_list_exams():
    """Test listing all exams"""
    print("\n" + "=" * 60)
    print("📋 TEST: List Exams API")
    print("=" * 60)
    
    result = api_get("/api/admin/exams")
    
    print_test("Status 200", result["status"] == 200, f"Got {result['status']}")
    print_test("Returns array", isinstance(result["data"], list) if result["data"] else False)
    
    if result["data"]:
        print(f"\n  📚 Found {len(result['data'])} exams:")
        for exam in result["data"]:
            print(f"      - {exam.get('id')}: {exam.get('title')}")
        return result["data"]
    return []

# ============================================================
# TEST 2: SUBMIT CORRECT ANSWERS
# ============================================================

def test_correct_answers(exam: Dict):
    """Test submitting all correct answers"""
    print("\n" + "=" * 60)
    print(f"✅ TEST: Correct Answers - {exam['id']}")
    print("=" * 60)
    
    answers = {}
    for q in exam.get("questions", []):
        qid = q["id"]
        if qid in CORRECT_ANSWERS:
            answers[qid] = CORRECT_ANSWERS[qid]
        else:
            answers[qid] = "print('test')"
    
    payload = {
        "examId": exam["id"],
        "studentName": f"ProdTest_Correct_{int(time.time())}",
        "answers": answers,
        "timeTakenSeconds": 120
    }
    
    result = api_post("/api/exam/submit", payload)
    
    print_test("Status 200", result["status"] == 200, f"Got {result['status']}")
    
    if result["status"] == 200:
        data = result["data"]
        total = data.get("totalScore", 0)
        max_total = data.get("totalPoints", 0)
        passed = data.get("passed", False)
        
        print_test("Has totalScore", "totalScore" in data)
        print_test("Has gradeDetails", "gradeDetails" in data)
        print_test("High score (>70%)", total > max_total * 0.7, f"{total}/{max_total}")
        
        print(f"\n  📊 Score: {total}/{max_total} | Passed: {passed}")
        
        if data.get("gradeDetails"):
            for qid, grade in list(data["gradeDetails"].items())[:3]:  # Show first 3
                print(f"      {qid}: {grade.get('score')}/{grade.get('maxScore')}")
        
        return total == max_total or total > max_total * 0.7
    return False

# ============================================================
# TEST 3: SUBMIT WRONG ANSWERS
# ============================================================

def test_wrong_answers(exam: Dict):
    """Test submitting all wrong answers"""
    print("\n" + "=" * 60)
    print(f"❌ TEST: Wrong Answers - {exam['id']}")
    print("=" * 60)
    
    answers = {}
    for q in exam.get("questions", []):
        answers[q["id"]] = WRONG_ANSWERS.get(q["id"], "x = 0")
    
    payload = {
        "examId": exam["id"],
        "studentName": f"ProdTest_Wrong_{int(time.time())}",
        "answers": answers,
        "timeTakenSeconds": 60
    }
    
    result = api_post("/api/exam/submit", payload)
    
    print_test("Status 200", result["status"] == 200)
    
    if result["status"] == 200:
        data = result["data"]
        total = data.get("totalScore", 0)
        max_total = data.get("totalPoints", 1)
        
        print_test("Low score (<30%)", total < max_total * 0.3, f"{total}/{max_total}")
        print(f"\n  📊 Score: {total}/{max_total} (expected low)")
        
        return total < max_total * 0.3
    return False

# ============================================================
# TEST 4: MIXED ANSWERS
# ============================================================

def test_mixed_answers(exam: Dict):
    """Test submitting mix of correct and wrong answers"""
    print("\n" + "=" * 60)
    print(f"⚠️ TEST: Mixed Answers - {exam['id']}")
    print("=" * 60)
    
    answers = {}
    questions = exam.get("questions", [])
    
    for i, q in enumerate(questions):
        qid = q["id"]
        # Alternate: correct, wrong, correct, wrong...
        if i % 2 == 0:
            answers[qid] = CORRECT_ANSWERS.get(qid, "print('ok')")
        else:
            answers[qid] = WRONG_ANSWERS.get(qid, "x = 0")
    
    payload = {
        "examId": exam["id"],
        "studentName": f"ProdTest_Mixed_{int(time.time())}",
        "answers": answers,
        "timeTakenSeconds": 90
    }
    
    result = api_post("/api/exam/submit", payload)
    
    print_test("Status 200", result["status"] == 200)
    
    if result["status"] == 200:
        data = result["data"]
        total = data.get("totalScore", 0)
        max_total = data.get("totalPoints", 1)
        
        # Should be between 30% and 70%
        is_partial = max_total * 0.3 <= total <= max_total * 0.7
        print_test("Partial score (30-70%)", is_partial, f"{total}/{max_total}")
        print(f"\n  📊 Score: {total}/{max_total} (expected partial)")
        
        return is_partial or (0 < total < max_total)
    return False

# ============================================================
# TEST 5: ANALYTICS API
# ============================================================

def test_analytics(exam_id: str):
    """Test analytics endpoint"""
    print("\n" + "=" * 60)
    print(f"📊 TEST: Analytics API - {exam_id}")
    print("=" * 60)
    
    result = api_get(f"/api/teacher/analytics?examId={exam_id}")
    
    print_test("Status 200", result["status"] == 200)
    
    if result["status"] == 200 and result["data"]:
        data = result["data"]
        submissions = data.get("submissions", [])
        
        print_test("Has submissions", len(submissions) > 0, f"{len(submissions)} found")
        
        if submissions:
            print(f"\n  📈 Recent submissions:")
            for sub in submissions[:3]:
                name = sub.get("studentName", "Unknown")
                score = sub.get("score", 0)
                has_details = bool(sub.get("gradeDetails"))
                print(f"      {name}: {score} pts | gradeDetails: {'✓' if has_details else '✗'}")
        
        return len(submissions) > 0
    return False

# ============================================================
# MAIN TEST RUNNER
# ============================================================

def run_all_tests():
    print("\n" + "=" * 70)
    print("🧪 PRODUCTION TEST SUITE - Apollo Code Concept")
    print("=" * 70)
    print(f"Target: {BASE_URL}")
    print("=" * 70)
    
    results = []
    
    # 1. List exams
    exams = test_list_exams()
    results.append(("List Exams", len(exams) > 0))
    
    # Find test exams
    test_exams = [e for e in exams if e.get("id") in ["daspro-en", "alpro-functions"]]
    
    if not test_exams:
        print("\n⚠️ No test exams found (daspro-en or alpro-functions)")
        test_exams = exams[:1]  # Use first available
    
    for exam in test_exams:
        # 2. Correct answers
        results.append((f"Correct - {exam['id']}", test_correct_answers(exam)))
        
        # 3. Wrong answers
        results.append((f"Wrong - {exam['id']}", test_wrong_answers(exam)))
        
        # 4. Mixed answers
        results.append((f"Mixed - {exam['id']}", test_mixed_answers(exam)))
        
        # 5. Analytics
        results.append((f"Analytics - {exam['id']}", test_analytics(exam['id'])))
    
    # Summary
    print("\n" + "=" * 70)
    print("📋 TEST SUMMARY")
    print("=" * 70)
    
    passed = 0
    for name, result in results:
        status = "✅" if result else "❌"
        print(f"  {status} {name}")
        if result:
            passed += 1
    
    print("\n" + "-" * 70)
    print(f"  Total: {passed}/{len(results)} tests passed")
    print("=" * 70)
    
    if passed == len(results):
        print("🎉 ALL TESTS PASSED!")
    else:
        print("⚠️ Some tests failed - check details above")

if __name__ == "__main__":
    run_all_tests()
