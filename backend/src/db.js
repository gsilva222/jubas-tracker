import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// A "pool" keeps multiple DB connections open and reuses them
// instead of opening a new connection on every request (much faster)
const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection on startup
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ DB connection error:', err.message));

export default pool;