const axios = require('axios');

const URL = "http://129.212.236.32:2358";

console.log("Testing connection to:", URL);

async function test() {
    try {
        console.log("\nTesting POST /submissions (wait=true)...");
        // Exact payload from user's successful curl
        const res = await axios.post(`${URL}/submissions`, {
            source_code: "print(\"System Fully Operational\")",
            language_id: 71
        }, {
            params: {
                base64_encoded: "false",
                wait: "true" // Waiting for result immediately
            }
        });

        console.log("Status:", res.status);
        console.log("Response Data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("FAILED:", e.message);
        if (e.response) {
            console.error("Response:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

test();
