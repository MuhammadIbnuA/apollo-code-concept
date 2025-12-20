
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '..', '.env');
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                process.env[key] = value;
            }
        });
    } catch (e) {
        console.warn("Could not load .env file:", e.message);
    }
}

loadEnv();

let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error("No DATABASE_URL found.");
    process.exit(1);
}

// Strip sslmode
if (DATABASE_URL.includes('?')) {
    DATABASE_URL = DATABASE_URL.replace(/[\?&]sslmode=require/, '');
}

console.log("Using DB URL:", DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
});

async function reset() {
    try {
        console.log("Connecting...");
        const client = await pool.connect();

        console.log("Dropping tables...");
        await client.query("DROP TABLE IF EXISTS lessons CASCADE");
        await client.query("DROP TABLE IF EXISTS results CASCADE");
        await client.query("DROP TABLE IF EXISTS submissions CASCADE");

        console.log("Tables dropped.");

        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

reset();
