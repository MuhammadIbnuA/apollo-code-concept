# ============================================================
# RUBRIC VALIDATION TEMPLATE v2
# For use with the fixed grading engine
# ============================================================
# AVAILABLE IN CONTEXT (__ctx__):
#   __STUDENT_CODE__ = student's source code (string)
#   All variables created by student code
#   __exec_error__ = error message if student code crashed
# ============================================================

import ast
import json

score = 0
breakdown = {}
errors = []

# Check if student code had execution error
if '__exec_error__' in dir():
    errors.append(f'execution_error: {__exec_error__}')

# ============================================================
# AST ANALYSIS - Check code structure
# ============================================================
try:
    tree = ast.parse(__STUDENT_CODE__)
    
    # Find all node types
    has_for = any(isinstance(n, ast.For) for n in ast.walk(tree))
    has_while = any(isinstance(n, ast.While) for n in ast.walk(tree))
    has_if = any(isinstance(n, ast.If) for n in ast.walk(tree))
    
    # Check for modulo with proper comparison
    has_even_check = False
    for node in ast.walk(tree):
        if isinstance(node, ast.Compare):
            if isinstance(node.left, ast.BinOp) and isinstance(node.left.op, ast.Mod):
                # Check if % 2 == 0
                if isinstance(node.left.right, ast.Constant) and node.left.right.value == 2:
                    for op, comp in zip(node.ops, node.comparators):
                        if isinstance(op, ast.Eq) and isinstance(comp, ast.Constant) and comp.value == 0:
                            has_even_check = True

    # CRITERION 1: Loop (3 pts)
    if has_for:
        breakdown['loop'] = 3
        score += 3
    elif has_while:
        breakdown['loop'] = 2
        score += 2
        errors.append('used_while_instead_of_for')
    else:
        breakdown['loop'] = 0
        errors.append('missing_loop')
    
    # CRITERION 2: Conditional (2 pts)
    if has_if:
        breakdown['condition'] = 2
        score += 2
    else:
        breakdown['condition'] = 0
        errors.append('missing_if')
    
    # CRITERION 3: Even check logic (2 pts)
    if has_even_check:
        breakdown['even_check'] = 2
        score += 2
    else:
        breakdown['even_check'] = 0
        errors.append('missing_or_incorrect_even_check')
        
except SyntaxError as e:
    errors.append(f'syntax_error: {e}')

# ============================================================
# RUNTIME CHECK - Verify output
# ============================================================
# CONFIGURE: Set expected output for your question
EXPECTED_OUTPUT = 30  # Sum of even numbers 0-10

# Check student's result variable
actual = None
for var_name in ['total', 'result', 'sum', 'answer']:
    if var_name in dir():
        actual = eval(var_name)
        break

# CRITERION 4: Correct output (3 pts)
if actual == EXPECTED_OUTPUT:
    breakdown['output'] = 3
    score += 3
elif actual is not None:
    # Partial credit - has output but wrong
    breakdown['output'] = 1
    score += 1
    errors.append(f'wrong_output: expected {EXPECTED_OUTPUT}, got {actual}')
else:
    breakdown['output'] = 0
    errors.append('no_output_variable')

# ============================================================
# OUTPUT RESULT
# ============================================================
print('__RUBRIC__' + json.dumps({
    "score": score,
    "max_score": 10,
    "breakdown": breakdown,
    "errors": errors
}))
