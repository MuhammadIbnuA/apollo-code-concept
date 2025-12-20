# ============================================================
# RUBRIC GRADING ENGINE - AST-Based Analysis
# ============================================================
# This validation code template uses AST parsing to analyze
# student code correctly without reading external files.
#
# HOW TO USE:
# 1. Copy this template to the "Validation Code" field in ExamEditor
# 2. Modify the RUBRIC CONFIG section for your question
# 3. Adjust the GRADING LOGIC for your specific requirements
# ============================================================

import ast
import json
import sys

# ============================================================
# RUBRIC CONFIG - Modify per question
# ============================================================
RUBRIC = {
    'initialization': 2,      # Variable declared correctly
    'loop_structure': 3,      # Correct loop type used
    'condition_logic': 3,     # Correct conditional logic
    'accumulator': 2,         # Correct accumulator pattern
}
MAX_SCORE = sum(RUBRIC.values())

# ============================================================
# STUDENT CODE CAPTURE - DO NOT MODIFY
# ============================================================
# Get student code from the execution context
# The student code is everything BEFORE this validation section
_student_code = None

def _capture_student_code():
    """
    Captures student code from the current execution context.
    Uses the fact that student code is executed first, then this grading code.
    """
    import inspect
    frame = inspect.currentframe()
    try:
        # Get the global namespace where student code was executed
        student_globals = frame.f_back.f_back.f_globals
        
        # Filter out built-ins and grading code
        student_vars = {}
        for name, value in student_globals.items():
            if not name.startswith('_') and name not in ['ast', 'json', 'sys', 'inspect']:
                student_vars[name] = value
        
        return student_vars
    finally:
        del frame

# ============================================================
# AST ANALYZER - DO NOT MODIFY
# ============================================================
class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.has_for_loop = False
        self.has_while_loop = False
        self.has_if_statement = False
        self.has_modulo_check = False
        self.has_even_check = False  # % 2 == 0
        self.has_odd_check = False   # % 2 != 0 or % 2 == 1
        self.has_accumulator = False
        self.assigns = []
        self.function_calls = []
        self.comparisons = []
        
    def visit_For(self, node):
        self.has_for_loop = True
        self.generic_visit(node)
        
    def visit_While(self, node):
        self.has_while_loop = True
        self.generic_visit(node)
        
    def visit_If(self, node):
        self.has_if_statement = True
        self.generic_visit(node)
        
    def visit_Assign(self, node):
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.assigns.append(target.id)
        self.generic_visit(node)
        
    def visit_AugAssign(self, node):
        if isinstance(node.target, ast.Name):
            self.has_accumulator = True
        self.generic_visit(node)
        
    def visit_Compare(self, node):
        # Check for modulo operations in comparisons
        if isinstance(node.left, ast.BinOp) and isinstance(node.left.op, ast.Mod):
            self.has_modulo_check = True
            # Check if it's % 2 == 0 (even check)
            if isinstance(node.left.right, ast.Constant) and node.left.right.value == 2:
                for i, (op, comparator) in enumerate(zip(node.ops, node.comparators)):
                    if isinstance(comparator, ast.Constant):
                        if isinstance(op, ast.Eq) and comparator.value == 0:
                            self.has_even_check = True
                        elif isinstance(op, ast.NotEq) and comparator.value == 0:
                            self.has_odd_check = True
                        elif isinstance(op, ast.Eq) and comparator.value == 1:
                            self.has_odd_check = True
        self.comparisons.append(ast.dump(node))
        self.generic_visit(node)
        
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            self.function_calls.append(node.func.id)
        self.generic_visit(node)

def analyze_code(source_code):
    """Parse and analyze student code using AST."""
    try:
        tree = ast.parse(source_code)
        analyzer = CodeAnalyzer()
        analyzer.visit(tree)
        return analyzer
    except SyntaxError as e:
        return None

# ============================================================
# GRADING LOGIC - Modify per question
# ============================================================
def grade_student_code(student_code_str, student_vars):
    """
    Grade the student's code based on rubric criteria.
    
    Args:
        student_code_str: The student's source code as string
        student_vars: Variables from student's execution context
    
    Returns:
        tuple: (score, breakdown, errors)
    """
    score = 0
    breakdown = {}
    errors = []
    
    # Parse the student code
    analysis = analyze_code(student_code_str)
    
    if analysis is None:
        errors.append("syntax_error")
        return 0, {k: 0 for k in RUBRIC}, errors
    
    # --- CRITERION 1: Initialization (2 pts) ---
    # Check if required variable is initialized
    if 'total' in analysis.assigns or 'result' in analysis.assigns or 'sum' in analysis.assigns:
        breakdown['initialization'] = RUBRIC['initialization']
        score += RUBRIC['initialization']
    else:
        breakdown['initialization'] = 0
        errors.append("missing_initialization")
    
    # --- CRITERION 2: Loop Structure (3 pts) ---
    # Check for proper loop usage
    if analysis.has_for_loop:
        breakdown['loop_structure'] = RUBRIC['loop_structure']
        score += RUBRIC['loop_structure']
    elif analysis.has_while_loop:
        # While loop is acceptable but less preferred
        breakdown['loop_structure'] = RUBRIC['loop_structure'] - 1
        score += RUBRIC['loop_structure'] - 1
        errors.append("while_instead_of_for")
    else:
        breakdown['loop_structure'] = 0
        errors.append("missing_loop")
    
    # --- CRITERION 3: Condition Logic (3 pts) ---
    # Check for correct conditional check
    if analysis.has_even_check:
        breakdown['condition_logic'] = RUBRIC['condition_logic']
        score += RUBRIC['condition_logic']
    elif analysis.has_modulo_check:
        # Has modulo but not correct pattern - partial credit
        breakdown['condition_logic'] = 1
        score += 1
        errors.append("incomplete_modulo_check")
    else:
        breakdown['condition_logic'] = 0
        errors.append("missing_condition")
    
    # --- CRITERION 4: Accumulator Pattern (2 pts) ---
    if analysis.has_accumulator:
        breakdown['accumulator'] = RUBRIC['accumulator']
        score += RUBRIC['accumulator']
    else:
        breakdown['accumulator'] = 0
        errors.append("missing_accumulator")
    
    return score, breakdown, errors

# ============================================================
# MAIN EXECUTION - DO NOT MODIFY
# ============================================================
if __name__ == "__main__" or True:  # Always run
    # Capture student context
    student_vars = _capture_student_code()
    
    # Get student code as string
    # Since we can't read __file__, we need the code passed differently
    # In the exam system, student code is concatenated before this
    # We'll analyze based on what variables exist
    
    # For AST analysis, we need the actual source
    # This is a workaround - in production, pass code as variable
    _student_source = globals().get('__STUDENT_CODE__', '')
    
    if not _student_source:
        # Fallback: analyze based on runtime state only
        score = 0
        breakdown = {}
        errors = []
        
        # Check initialization
        if any(v in student_vars for v in ['total', 'result', 'sum', 'count']):
            breakdown['initialization'] = 2
            score += 2
        else:
            breakdown['initialization'] = 0
            errors.append("no_result_variable")
        
        # Check if output is correct (if 'total' exists and has expected value)
        expected = None  # Set expected value for your question
        actual = student_vars.get('total') or student_vars.get('result')
        
        if expected is not None and actual == expected:
            breakdown['correctness'] = 8
            score += 8
        elif actual is not None:
            breakdown['correctness'] = 4  # Partial credit for having output
            score += 4
            errors.append("incorrect_output")
        else:
            breakdown['correctness'] = 0
            errors.append("no_output")
        
        MAX_SCORE = 10
    else:
        score, breakdown, errors = grade_student_code(_student_source, student_vars)
    
    # Output rubric result
    print('__RUBRIC__' + json.dumps({
        "score": score,
        "max_score": MAX_SCORE,
        "breakdown": breakdown,
        "errors": errors
    }))
