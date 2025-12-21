/**
 * Database Wake-Up Script
 * Wakes up sleeping free-tier databases (e.g., Neon, Supabase free tier)
 * 
 * Usage: node scripts/wake-db.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function wakeDatabase() {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set in .env file');
        process.exit(1);
    }

    // Remove sslmode from URL if present
    const cleanUrl = DATABASE_URL.replace(/[?&]sslmode=require/g, '');
    console.log('🔌 Connecting to:', cleanUrl.replace(/:[^:@]*@/, ':****@'));

    const pool = new Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000, // 30 seconds for sleeping DB
    });

    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║            🌅 Database Wake-Up Script                  ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`⏳ Attempt ${attempt}/${MAX_RETRIES}: Pinging database...`);

        try {
            const client = await pool.connect();

            // Simple query to wake up and test the database
            const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');

            console.log('');
            console.log('✅ Database is AWAKE!');
            console.log(`   📅 Server Time: ${result.rows[0].current_time}`);
            console.log(`   📁 Database: ${result.rows[0].db_name}`);

            // Check tables exist
            const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

            console.log('');
            console.log('📊 Tables found:');
            if (tablesResult.rows.length === 0) {
                console.log('   (No tables yet - will be created on first API call)');
            } else {
                tablesResult.rows.forEach(row => {
                    console.log(`   - ${row.table_name}`);
                });
            }

            // Quick count check
            try {
                const examsCount = await client.query('SELECT COUNT(*) FROM exams');
                const lessonsCount = await client.query('SELECT COUNT(*) FROM lessons');
                console.log('');
                console.log('📈 Data summary:');
                console.log(`   - Exams: ${examsCount.rows[0].count}`);
                console.log(`   - Lessons: ${lessonsCount.rows[0].count}`);
            } catch {
                console.log('   (Tables not yet initialized)');
            }

            client.release();
            await pool.end();

            console.log('');
            console.log('🎉 Database is ready to use!');
            console.log('');
            process.exit(0);

        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);

            if (attempt < MAX_RETRIES) {
                console.log(`   ⏰ Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                console.log('');
                await sleep(RETRY_DELAY_MS);
            } else {
                console.log('');
                console.log('❌ Could not wake up database after maximum retries.');
                console.log('   Please check:');
                console.log('   1. DATABASE_URL is correct');
                console.log('   2. Database service is running');
                console.log('   3. Network connectivity');
                console.log('');
                await pool.end();
                process.exit(1);
            }
        }
    }
}

// Run the script
wakeDatabase();
