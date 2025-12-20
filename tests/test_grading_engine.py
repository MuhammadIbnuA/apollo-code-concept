"""
Test Script for Rubric Grading Engine
Run this to verify the grading engine works correctly.
"""

import base64
import json

# ============================================================
# SIMULATED GRADING ENGINE (same logic as rubricGrader.ts)
# ============================================================
def run_grading_engine(student_code: str, validation_code: str) -> dict:
    """
    Simulates the grading engine execution.
    This mirrors what happens in rubricGrader.ts
    """
    # Base64 encode (as the TypeScript does)
    base64_student = base64.b64encode(student_code.encode('utf-8')).decode('utf-8')
    base64_validation = base64.b64encode(validation_code.encode('utf-8')).decode('utf-8')
    
    # Build the combined script (same as rubricGrader.ts)
    combined_code = f'''import base64
import ast
import json

# Decode student code and store in globals
globals()['__STUDENT_CODE__'] = base64.b64decode("{base64_student}").decode('utf-8')
globals()['__exec_error__'] = None

# Execute student code in global namespace
try:
    exec(globals()['__STUDENT_CODE__'], globals())
except Exception as e:
    globals()['__exec_error__'] = str(e)

# Execute validation code in same global namespace
__validation_code__ = base64.b64decode("{base64_validation}").decode('utf-8')
exec(__validation_code__, globals())
'''
    
    # Execute and capture output
    import io
    import sys
    
    old_stdout = sys.stdout
    sys.stdout = buffer = io.StringIO()
    
    exec_globals = {}
    try:
        exec(combined_code, exec_globals)
        output = buffer.getvalue()
        return {"success": True, "output": output, "error": None}
    except Exception as e:
        output = buffer.getvalue()
        return {"success": False, "output": output, "error": str(e)}
    finally:
        sys.stdout = old_stdout


def parse_rubric_output(output: str) -> dict:
    """Parse __RUBRIC__ output from grading"""
    marker = "__RUBRIC__"
    if marker in output:
        json_str = output.split(marker)[1].strip().split('\n')[0]
        return json.loads(json_str)
    return None


# ============================================================
# TEST CASES
# ============================================================

def test_assertion_grading():
    """Test simple assertion-based grading (no rubric)"""
    print("\n" + "="*60)
    print("TEST 1: Simple Assertion Grading")
    print("="*60)
    
    student_code = """
score = 100
print(f"Score is {score}")
"""
    
    validation_code = """
assert score == 100, "Score should be 100"
print("✅ All assertions passed!")
"""
    
    result = run_grading_engine(student_code, validation_code)
    print(f"Success: {result['success']}")
    print(f"Output: {result['output']}")
    if result['error']:
        print(f"Error: {result['error']}")
    
    return result['success'] and "✅ All assertions passed!" in result['output']


def test_rubric_grading():
    """Test rubric-based grading with __STUDENT_CODE__ access"""
    print("\n" + "="*60)
    print("TEST 2: Rubric Grading with AST Analysis")
    print("="*60)
    
    student_code = """
# Sum of even numbers from 0 to 10
total = 0
for i in range(11):
    if i % 2 == 0:
        total += i
print(f"Total: {total}")
"""
    
    validation_code = """
import ast
import json

score = 0
breakdown = {}
errors = []

# Check __STUDENT_CODE__ is available
if '__STUDENT_CODE__' not in globals():
    errors.append('__STUDENT_CODE__ not defined!')
else:
    # AST Analysis
    try:
        tree = ast.parse(__STUDENT_CODE__)
        
        has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))
        has_if = any(isinstance(n, ast.If) for n in ast.walk(tree))
        
        # Check for modulo
        has_modulo = any(
            isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mod) 
            for n in ast.walk(tree)
        )
        
        if has_for:
            breakdown['loop'] = 3
            score += 3
        else:
            breakdown['loop'] = 0
            errors.append('missing_for_loop')
        
        if has_if:
            breakdown['condition'] = 2
            score += 2
        else:
            breakdown['condition'] = 0
            errors.append('missing_if')
        
        if has_modulo:
            breakdown['modulo'] = 2
            score += 2
        else:
            breakdown['modulo'] = 0
            errors.append('missing_modulo')
            
    except SyntaxError as e:
        errors.append(f'syntax_error: {e}')

# Runtime check
if 'total' in globals() and total == 30:
    breakdown['output'] = 3
    score += 3
elif 'total' in globals():
    breakdown['output'] = 1
    score += 1
    errors.append(f'wrong_output: expected 30, got {total}')
else:
    breakdown['output'] = 0
    errors.append('no_total_variable')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
"""
    
    result = run_grading_engine(student_code, validation_code)
    print(f"Success: {result['success']}")
    print(f"Output:\n{result['output']}")
    if result['error']:
        print(f"Error: {result['error']}")
    
    rubric = parse_rubric_output(result['output'])
    if rubric:
        print(f"\nRubric Result:")
        print(f"  Score: {rubric['score']}/{rubric['max_score']}")
        print(f"  Breakdown: {rubric['breakdown']}")
        print(f"  Errors: {rubric['errors']}")
        return rubric['score'] == 10
    return False


def test_wrong_answer():
    """Test grading with wrong answer (partial credit)"""
    print("\n" + "="*60)
    print("TEST 3: Partial Credit (Wrong Output)")
    print("="*60)
    
    student_code = """
# WRONG: Sum of ODD numbers instead of even
total = 0
for i in range(11):
    if i % 2 != 0:  # Wrong condition!
        total += i
"""
    
    validation_code = """
import ast
import json

score = 0
breakdown = {}
errors = []

tree = ast.parse(__STUDENT_CODE__)

has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))
has_if = any(isinstance(n, ast.If) for n in ast.walk(tree))
has_modulo = any(isinstance(n, ast.BinOp) and isinstance(n.op, ast.Mod) for n in ast.walk(tree))

if has_for:
    breakdown['loop'] = 3
    score += 3

if has_if:
    breakdown['condition'] = 2
    score += 2

if has_modulo:
    breakdown['modulo'] = 2
    score += 2

# Runtime check - should FAIL
if 'total' in globals() and total == 30:
    breakdown['output'] = 3
    score += 3
elif 'total' in globals():
    breakdown['output'] = 1
    score += 1
    errors.append(f'wrong_output: expected 30, got {total}')
else:
    breakdown['output'] = 0
    errors.append('no_total_variable')

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
"""
    
    result = run_grading_engine(student_code, validation_code)
    print(f"Success: {result['success']}")
    print(f"Output:\n{result['output']}")
    
    rubric = parse_rubric_output(result['output'])
    if rubric:
        print(f"\nRubric Result:")
        print(f"  Score: {rubric['score']}/{rubric['max_score']}")
        print(f"  Breakdown: {rubric['breakdown']}")
        print(f"  Errors: {rubric['errors']}")
        # Should get 8/10 (loop=3 + condition=2 + modulo=2 + output=1)
        return rubric['score'] == 8
    return False


def test_no_loop():
    """Test grading with missing loop"""
    print("\n" + "="*60)
    print("TEST 4: Missing Loop (Should Get 0 for loop criterion)")
    print("="*60)
    
    student_code = """
# WRONG: No loop at all, hardcoded answer
total = 30
"""
    
    validation_code = """
import ast
import json

score = 0
breakdown = {}
errors = []

tree = ast.parse(__STUDENT_CODE__)

has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))

if has_for:
    breakdown['loop'] = 3
    score += 3
else:
    breakdown['loop'] = 0
    errors.append('missing_for_loop')

# Runtime check
if 'total' in globals() and total == 30:
    breakdown['output'] = 3
    score += 3
else:
    breakdown['output'] = 0

print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 6,
    "breakdown": breakdown,
    "errors": errors
}))
"""
    
    result = run_grading_engine(student_code, validation_code)
    print(f"Success: {result['success']}")
    print(f"Output:\n{result['output']}")
    
    rubric = parse_rubric_output(result['output'])
    if rubric:
        print(f"\nRubric Result:")
        print(f"  Score: {rubric['score']}/{rubric['max_score']}")
        print(f"  Breakdown: {rubric['breakdown']}")
        print(f"  Errors: {rubric['errors']}")
        # Should get 3/6 (loop=0, output=3)
        return rubric['score'] == 3 and 'missing_for_loop' in rubric['errors']
    return False


# ============================================================
# RUN ALL TESTS
# ============================================================
if __name__ == "__main__":
    print("\n" + "="*60)
    print("RUBRIC GRADING ENGINE TEST SUITE")
    print("="*60)
    
    results = []
    
    results.append(("Assertion Grading", test_assertion_grading()))
    results.append(("Rubric Grading (Correct Answer)", test_rubric_grading()))
    results.append(("Rubric Grading (Wrong Answer)", test_wrong_answer()))
    results.append(("Rubric Grading (Missing Loop)", test_no_loop()))
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {name}: {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "="*60)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
    else:
        print("⚠️ SOME TESTS FAILED - CHECK OUTPUT ABOVE")
    print("="*60)
