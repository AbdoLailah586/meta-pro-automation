const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Cpfy34RkcLbX@ep-morning-block-b20747cx-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const c = await pool.query("SELECT value FROM public.baileys_auth_store WHERE key = 'creds'");
  if (c.rows[0]) {
    const creds = JSON.parse(c.rows[0].value);
    console.log('Registered:', creds.registered);
    console.log('Me:', creds.me);
  } else {
    console.log('No creds found');
  }
  await pool.end();
}
run().catch(console.error);
