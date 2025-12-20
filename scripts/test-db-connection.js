
require('dotenv').config();
const { Pool } = require('pg');

let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env file");
    process.exit(1);
}

// Remove sslmode from string to prevent conflicts, we will set it manually in config
DATABASE_URL = DATABASE_URL.replace('?sslmode=require', '').replace('&sslmode=require', '');

console.log("Testing connection to:", DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // This allows self-signed certs
    },
    connectionTimeoutMillis: 10000,
});

(async () => {
    try {
        console.log("Connecting...");
        const client = await pool.connect();
        console.log("✅ Successfully connected to DB!");

        console.log("Running query: SELECT NOW()");
        const res = await client.query('SELECT NOW()');
        console.log("✅ Query Result:", res.rows[0]);

        client.release();
        await pool.end();
        process.exit(0);
    } catch (e) {
        console.error("❌ Connection Failed:", e.message);
        console.error("Error Code:", e.code);
        process.exit(1);
    }
})();
