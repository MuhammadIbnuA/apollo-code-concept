export interface Question {
    id: string;
    title: string;
    description: string;
    initialCode: string;
    validationCode: string; // Hidden assertions
    points: number;
}

export interface Exam {
    id: string;
    title: string;
    durationMinutes: number;
    questions: Question[];
}

export const MOCK_EXAM: Exam = {
    id: "midterm-1",
    title: "Midterm Exam: Python Basics",
    durationMinutes: 45,
    questions: [
        {
            id: "q1",
            title: "Question 1: Variables",
            description: "Create a variable named `score` with value 100 and print it.",
            initialCode: "# Write your code here\n",
            validationCode: "assert score == 100\nprint('Correct')",
            points: 10
        },
        {
            id: "q2",
            title: "Question 2: Loops",
            description: "Write a for loop that prints numbers from 0 to 4.",
            initialCode: "# Write your code here\n",
            validationCode: "", // We might need output capture validation here, simplified for now
            points: 20
        }
    ]
};
