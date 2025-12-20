"""
Debug script to check exam structure and test grading
"""
import requests
import json

BASE_URL = "http://localhost:3000"

def debug_exam():
    print("=" * 60)
    print("DEBUG: Checking daspro-en exam structure")
    print("=" * 60)
    
    # Get exam data
    res = requests.get(f"{BASE_URL}/api/admin/exams")
    exams = res.json()
    
    daspro = next((e for e in exams if e.get("id") == "daspro-en"), None)
    
    if not daspro:
        print("❌ daspro-en not found!")
        return
    
    print(f"\n📋 Exam: {daspro['title']}")
    print(f"   ID: {daspro['id']}")
    print(f"   Questions: {len(daspro['questions'])}")
    
    print("\n📝 Question Details:")
    for q in daspro['questions']:
        print(f"\n   --- {q['id']} ---")
        print(f"   Title: {q['title']}")
        print(f"   Points: {q['points']}")
        print(f"   GradingType: {q.get('gradingType', 'assertion (default)')}")
        print(f"   Has validationCode: {'Yes' if q.get('validationCode') else 'No'}")
        if q.get('validationCode'):
            vc = q['validationCode']
            print(f"   ValidationCode preview: {vc[:100]}...")
    
    # Test submission with actual question IDs
    print("\n" + "=" * 60)
    print("DEBUG: Testing submission with actual question IDs")
    print("=" * 60)
    
    answers = {}
    for q in daspro['questions']:
        if 'genap' in q['title'].lower() or 'even' in q['title'].lower() or q['id'] == 'q1':
            answers[q['id']] = """total = 0
for i in range(1, 11):
    if i % 2 == 0:
        total += i
print(total)"""
        elif 'lulus' in q['title'].lower() or 'status' in q['title'].lower() or q['id'] == 'q2':
            answers[q['id']] = """nilai = 80
if nilai >= 75:
    status = "Lulus"
else:
    status = "Tidak Lulus"
print(status)"""
        elif 'ganjil' in q['title'].lower() or 'odd' in q['title'].lower() or q['id'] == 'q3':
            answers[q['id']] = """count = 0
for i in range(1, 11):
    if i % 2 != 0:
        count += 1
print(count)"""
        else:
            answers[q['id']] = f"# Answer for {q['id']}\nresult = 42\nprint(result)"
    
    print(f"\nAnswers prepared for: {list(answers.keys())}")
    
    # Submit
    payload = {
        "examId": daspro['id'],
        "studentName": f"DebugUser_{int(__import__('time').time())}",
        "answers": answers,
        "timeTakenSeconds": 120
    }
    
    print("\nSubmitting...")
    res = requests.post(
        f"{BASE_URL}/api/exam/submit",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=60
    )
    
    print(f"\nStatus: {res.status_code}")
    
    data = res.json()
    print(f"\nResponse:")
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    debug_exam()
