# Guide: Creating Auto-Graded Coding Questions

This guide explains how to create Python coding questions for the Apollo Learning Platform, focusing on **Initial Code** and **Hidden Validation Code**.

## 1. Overview

When creating a new lesson or exam question in the **Teacher Editor**, you have two main code sections to configure:

1.  **Initial Student Code**: The code that students see when they first open the challenge.
2.  **Validation Code**: Hidden code that runs *after* the student's code to verify their solution.

## 2. Validation Type

In the editor, ensure you select:
*   **Validation Type**: `Hidden Validation Code`

This enables the **Hidden Validation Code (Python)** editor.

> [!NOTE]
> The "Expected Output" validation type is simpler but less flexible. It only checks if the text printed to the console matches exactly. "Hidden Validation Code" allows for powerful logic checks using variables.

## 3. How It Works

When a student clicks "Run" or "Submit":
1.  The system takes the **Student's Code**.
2.  It appends the **Hidden Validation Code** to the end of it.
3.  It runs the combined script.
4.  If the script runs **without errors**, the answer is marked **CORRECT**.
5.  If an error (specifically an `AssertionError`) occurs, it is marked **INCORRECT**.

## 4. Writing Initial Code

This is the scaffolding for the student.

**Example:**
```python
# Calculate the area of a rectangle with width 10 and height 5
width = 10
height = 5

# Write your code below to calculate 'area'
area = ... 
```

## 5. Writing Hidden Validation Code (Assertions)

Use Python's `assert` statement to check if the student's variables or functions are correct.

**Syntax:**
```python
assert CONDITION, "ERROR MESSAGE"
```

### Scenario A: Checking a Variable

If the task is to calculate `area` (should be 50):

**Validation Code:**
```python
# Check if variable 'area' exists
assert 'area' in locals(), "Variable 'area' is missing!"

# Check if value is correct
assert area == 50, f"Expected area to be 50, but got {area}"

print("Correct! Great job.")
```

### Scenario B: Checking a Function

If the task is to write a function `sum_numbers(a, b)`:

**Initial Code:**
```python
def sum_numbers(a, b):
    # Return the sum of a and b
    pass
```

**Validation Code:**
```python
# 1. Test basic case
assert sum_numbers(2, 3) == 5, "sum_numbers(2, 3) should be 5"

# 2. Test negative numbers
assert sum_numbers(-1, 1) == 0, "sum_numbers(-1, 1) should be 0"

# 3. Test edge case
assert sum_numbers(0, 0) == 0, "sum_numbers(0, 0) should be 0"
```

### Scenario C: Preventing Hardcoding

Sometimes students just print the answer without calculating it. You can prevent this by running the function with different inputs than the example.

**Validation Code:**
```python
# Test with random inputs to ensure logic is correct
assert sum_numbers(100, 200) == 300, "Your function failed on hidden test case (100, 200)"
```

## 6. Best Practices

*   **Provide Feedback**: The error message in the `assert` statement is what the student sees if they fail. Make it helpful!
*   **Check Existence**: often checking `'variable_name' in locals()` is a good first step to avoid `NameError` crashing the script before your custom assertion.
*   **Edge Cases**: test boundaries (0, empty strings, negative numbers) to ensure robust code.
