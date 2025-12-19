import axios from "axios";
import { CONFIG } from "@/config";

// Use internal proxy to avoid CORS
const API_URL = "/api/judge0";

export interface ExecutionResult {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    status: {
        id: number;
        description: string;
    };
    time: string;
    memory: number;
}

export async function submitCode(sourceCode: string): Promise<string> {
    console.log("[Judge0] Submitting code via proxy...");
    try {
        const response = await axios.post(`${API_URL}/submissions`, {
            source_code: sourceCode,
            language_id: 71, // Python (3.8.1)
            stdin: "",
        }, {
            params: {
                base64_encoded: false,
                wait: false
            }
        });
        console.log("[Judge0] Submission successful. Token:", response.data.token);
        return response.data.token;
    } catch (error: any) {
        console.error("[Judge0] Submission Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.details || "Failed to submit code to Judge0");
    }
}

export async function getSubmissionStatus(token: string): Promise<ExecutionResult> {
    try {
        const response = await axios.get(`${API_URL}/submissions/${token}`, {
            params: {
                base64_encoded: false,
                fields: "stdout,stderr,status,message,compile_output,time,memory"
            }
        });
        return response.data;
    } catch (error: any) {
        console.error("[Judge0] Polling Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.details || "Failed to get submission status");
    }
}

export async function runCode(sourceCode: string): Promise<ExecutionResult> {
    console.log("[Judge0] Running code (sync)...");
    try {
        const response = await axios.post(`${API_URL}/submissions`, {
            source_code: sourceCode,
            language_id: 71, // Python (3.8.1)
            stdin: "",
        }, {
            params: {
                base64_encoded: false,
                wait: true // Wait for result (Sync)
            }
        });

        console.log("[Judge0] Execution result:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("[Judge0] Execution Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.details || "Failed to execute code");
    }
}
