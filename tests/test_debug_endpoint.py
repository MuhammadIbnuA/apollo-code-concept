"""
Test script that calls the debug endpoint to verify actual Judge0 execution
"""
import requests
import json

BASE_URL = "http://localhost:3000"

def test_debug_endpoint():
    print("Testing Debug Endpoint...")
    print("="*60)
    
    student_code = """
total = 0
for i in range(11):
    if i % 2 == 0:
        total += i
"""
    
    validation_code = """
import ast
import json

score = 0
breakdown = {}
errors = []

# Check __STUDENT_CODE__
if '__STUDENT_CODE__' not in globals():
    errors.append('__STUDENT_CODE__ NOT DEFINED!')
    print('ERROR: __STUDENT_CODE__ is not in globals()')
    print('Available globals:', [k for k in globals().keys() if not k.startswith('__') or k == '__STUDENT_CODE__'])
else:
    print('SUCCESS: __STUDENT_CODE__ is available')
    tree = ast.parse(__STUDENT_CODE__)
    has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))
    if has_for:
        breakdown['loop'] = 3
        score += 3

if 'total' in globals() and total == 30:
    breakdown['output'] = 3
    score += 3

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 6,
    "breakdown": breakdown,
    "errors": errors
}))
"""
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/debug/grade",
            json={
                "studentCode": student_code,
                "validationCode": validation_code
            },
            timeout=30
        )
        
        data = response.json()
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('judge0Response'):
            jr = data['judge0Response']
            print("\n--- Judge0 Response ---")
            print(f"Status: {jr.get('status')}")
            print(f"Stdout: {jr.get('stdout')}")
            print(f"Stderr: {jr.get('stderr')}")
            print(f"Compile Output: {jr.get('compile_output')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_debug_endpoint()
