"""
Functional Test Suite for Exam System
Tests the daspro-en exam and all grading functionality
"""

import requests
import json
import time
from typing import Dict, Any, Optional

BASE_URL = "http://localhost:3000"

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def api_get(endpoint: str) -> Dict[str, Any]:
    """Make GET request to API"""
    response = requests.get(f"{BASE_URL}{endpoint}", timeout=30)
    return {"status": response.status_code, "data": response.json()}

def api_post(endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Make POST request to API"""
    response = requests.post(
        f"{BASE_URL}{endpoint}",
        json=data,
        headers={"Content-Type": "application/json"},
        timeout=60
    )
    return {"status": response.status_code, "data": response.json()}

def print_result(test_name: str, passed: bool, details: str = ""):
    """Print test result"""
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"  {test_name}: {status}")
    if details and not passed:
        print(f"    Details: {details}")

# ============================================================
# TEST: LIST EXAMS API
# ============================================================

def test_list_exams():
    """Test GET /api/admin/exams"""
    print("\n📋 TEST: List Exams API")
    print("-" * 50)
    
    try:
        result = api_get("/api/admin/exams")
        
        passed = result["status"] == 200
        print_result("Status Code 200", passed, f"Got {result['status']}")
        
        passed = isinstance(result["data"], list)
        print_result("Returns Array", passed)
        
        # Check if daspro-en exists
        exams = result["data"]
        daspro = next((e for e in exams if e.get("id") == "daspro-en"), None)
        passed = daspro is not None
        print_result("daspro-en Exists", passed)
        
        if daspro:
            passed = len(daspro.get("questions", [])) > 0
            print_result("Has Questions", passed, f"Found {len(daspro.get('questions', []))} questions")
            
        return daspro
        
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return None

# ============================================================
# TEST: EXAM SUBMISSION (Correct Answers)
# ============================================================

def test_submit_correct_answers(exam: Dict[str, Any]):
    """Test submitting correct answers and getting rubric breakdown"""
    print("\n📝 TEST: Submit Exam (Correct Answers)")
    print("-" * 50)
    
    if not exam:
        print("  ⚠️ SKIPPED: No exam data")
        return
    
    # Prepare correct answers for each question type
    correct_answers = {
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
print(count)"""
    }
    
    # Build answers based on actual questions
    answers = {}
    for q in exam.get("questions", []):
        if q["id"] in correct_answers:
            answers[q["id"]] = correct_answers[q["id"]]
        else:
            answers[q["id"]] = "# No answer"
    
    try:
        result = api_post("/api/exam/submit", {
            "examId": exam["id"],
            "studentName": f"TestUser_{int(time.time())}",
            "answers": answers,
            "timeTakenSeconds": 120
        })
        
        passed = result["status"] == 200
        print_result("Status Code 200", passed, f"Got {result['status']}")
        
        data = result["data"]
        
        passed = "totalScore" in data
        print_result("Has totalScore", passed)
        
        passed = "gradeDetails" in data
        print_result("Has gradeDetails", passed)
        
        if "gradeDetails" in data:
            for qid, grade in data["gradeDetails"].items():
                score = grade.get("score", 0)
                max_score = grade.get("maxScore", 0)
                passed = score > 0
                print_result(f"  {qid}: {score}/{max_score}", passed)
                
                if grade.get("breakdown"):
                    print(f"      Breakdown: {grade['breakdown']}")
                if grade.get("errors"):
                    print(f"      Errors: {grade['errors']}")
        
        total = data.get("totalScore", 0)
        total_max = data.get("totalPoints", 0)
        print(f"\n  📊 Total Score: {total}/{total_max}")
        
        return data
        
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return None

# ============================================================
# TEST: EXAM SUBMISSION (Partial Credit)
# ============================================================

def test_submit_partial_answers(exam: Dict[str, Any]):
    """Test submitting partially correct answers"""
    print("\n📝 TEST: Submit Exam (Partial Credit)")
    print("-" * 50)
    
    if not exam:
        print("  ⚠️ SKIPPED: No exam data")
        return
    
    # Prepare partially correct answers
    partial_answers = {
        "q1": """total = 0
# Missing loop - should get partial credit
total = 30
print(total)""",
        
        "q2": """nilai = 80
# Wrong condition (> instead of >=)
if nilai > 75:
    status = "Lulus"
else:
    status = "Tidak Lulus"
print(status)""",
        
        "q3": """count = 0
for i in range(1, 11):
    # Wrong: counting even instead of odd
    if i % 2 == 0:
        count += 1
print(count)"""
    }
    
    answers = {}
    for q in exam.get("questions", []):
        if q["id"] in partial_answers:
            answers[q["id"]] = partial_answers[q["id"]]
        else:
            answers[q["id"]] = "# No answer"
    
    try:
        result = api_post("/api/exam/submit", {
            "examId": exam["id"],
            "studentName": f"PartialUser_{int(time.time())}",
            "answers": answers,
            "timeTakenSeconds": 90
        })
        
        passed = result["status"] == 200
        print_result("Status Code 200", passed)
        
        data = result["data"]
        
        if "gradeDetails" in data:
            for qid, grade in data["gradeDetails"].items():
                score = grade.get("score", 0)
                max_score = grade.get("maxScore", 0)
                # Partial credit should be > 0 but < max
                is_partial = 0 < score < max_score
                print_result(f"  {qid}: {score}/{max_score} (partial)", is_partial or score == max_score)
                
                if grade.get("errors"):
                    print(f"      Errors: {grade['errors'][:2]}")  # Show first 2 errors
        
        total = data.get("totalScore", 0)
        total_max = data.get("totalPoints", 0)
        print(f"\n  📊 Total Score: {total}/{total_max} (should be partial)")
        
        return data
        
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return None

# ============================================================
# TEST: EXAM SUBMISSION (Wrong Answers)
# ============================================================

def test_submit_wrong_answers(exam: Dict[str, Any]):
    """Test submitting completely wrong answers"""
    print("\n📝 TEST: Submit Exam (Wrong Answers)")
    print("-" * 50)
    
    if not exam:
        print("  ⚠️ SKIPPED: No exam data")
        return
    
    # Prepare wrong answers
    wrong_answers = {
        "q1": """# Completely wrong
x = 5
print("hello")""",
        
        "q2": """# No if statement
hasil = "test" """,
        
        "q3": """# Hardcoded wrong value
count = 999
print(count)"""
    }
    
    answers = {}
    for q in exam.get("questions", []):
        if q["id"] in wrong_answers:
            answers[q["id"]] = wrong_answers[q["id"]]
        else:
            answers[q["id"]] = "# Empty"
    
    try:
        result = api_post("/api/exam/submit", {
            "examId": exam["id"],
            "studentName": f"WrongUser_{int(time.time())}",
            "answers": answers,
            "timeTakenSeconds": 60
        })
        
        passed = result["status"] == 200
        print_result("Status Code 200", passed)
        
        data = result["data"]
        
        if "gradeDetails" in data:
            for qid, grade in data["gradeDetails"].items():
                score = grade.get("score", 0)
                max_score = grade.get("maxScore", 0)
                # Wrong answers should get very low or 0 score
                is_low = score < max_score / 2
                print_result(f"  {qid}: {score}/{max_score} (low)", is_low)
        
        total = data.get("totalScore", 0)
        total_max = data.get("totalPoints", 0)
        print(f"\n  📊 Total Score: {total}/{total_max} (should be low)")
        
        return data
        
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return None

# ============================================================
# TEST: ANALYTICS API
# ============================================================

def test_analytics(exam_id: str):
    """Test analytics endpoint"""
    print("\n📊 TEST: Analytics API")
    print("-" * 50)
    
    try:
        result = api_get(f"/api/teacher/analytics?examId={exam_id}")
        
        passed = result["status"] == 200
        print_result("Status Code 200", passed, f"Got {result['status']}")
        
        data = result["data"]
        
        if isinstance(data, dict):
            passed = "submissions" in data
            print_result("Has submissions", passed)
            
            if "submissions" in data:
                print(f"  📈 Total Submissions: {len(data['submissions'])}")
                
                # Check if recent submissions have gradeDetails
                recent = data["submissions"][:3] if len(data["submissions"]) > 0 else []
                for sub in recent:
                    has_details = "gradeDetails" in sub and sub["gradeDetails"]
                    print_result(f"  {sub.get('studentName', 'Unknown')}: gradeDetails", has_details)
        
        return data
        
    except Exception as e:
        print(f"  ❌ ERROR: {e}")
        return None

# ============================================================
# MAIN TEST RUNNER
# ============================================================

def run_all_tests():
    """Run all functional tests"""
    print("\n" + "=" * 60)
    print("🧪 FUNCTIONAL TEST SUITE - EXAM SYSTEM")
    print("=" * 60)
    print(f"Target: {BASE_URL}")
    print("=" * 60)
    
    # Test 1: List exams
    exam = test_list_exams()
    
    if exam:
        # Test 2: Submit correct answers
        test_submit_correct_answers(exam)
        
        # Test 3: Submit partial answers
        test_submit_partial_answers(exam)
        
        # Test 4: Submit wrong answers
        test_submit_wrong_answers(exam)
        
        # Test 5: Analytics
        test_analytics(exam["id"])
    
    print("\n" + "=" * 60)
    print("🏁 TESTS COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    run_all_tests()
