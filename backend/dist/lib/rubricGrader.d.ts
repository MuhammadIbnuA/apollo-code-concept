/**
 * Rubric Grader
 * Code grading logic using Judge0 for Python execution
 */
import type { GradeResult } from '../lib/types.js';
/**
 * Grade a student's code using rubric-based validation
 */
export declare function gradeWithRubric(studentCode: string, validationCode: string, questionId: string, maxPoints: number, customMarker?: string): Promise<GradeResult>;
/**
 * Grade using simple assertion (fallback for non-rubric questions)
 */
export declare function gradeWithAssertion(studentCode: string, validationCode: string, questionId: string, maxPoints: number): Promise<GradeResult>;
//# sourceMappingURL=rubricGrader.d.ts.map