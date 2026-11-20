import { drizzle } from 'drizzle-orm/node-postgres';
<<<<<<< HEAD
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();
=======
import { Pool } from 'pg';
import * as schema from './schema.ts';
>>>>>>> daa60db0deb6cc4182499fc087d4e9f119aec75d

declare global {
  var _postgresPool: Pool | undefined;
}

<<<<<<< HEAD
/**
 * Creates and configures the PostgreSQL Pool for Supabase or standard PostgreSQL.
 * Supports both connection strings (DATABASE_URL / SUPABASE_DB_URL) and individual parameters.
 */
export const createPool = (): Pool => {
  if (!global._postgresPool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.SUPABASE_DB_URL ||
      process.env.POSTGRES_URL;

    const isSupabase =
      Boolean(connectionString?.includes('supabase.co')) ||
      Boolean(connectionString?.includes('pooler.supabase.com')) ||
      Boolean(process.env.SUPABASE_URL) ||
      process.env.DB_SSL === 'true' ||
      process.env.NODE_ENV === 'production';

    const poolConfig: PoolConfig = connectionString
      ? {
          connectionString,
          ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
          idleTimeoutMillis: 30000,
        }
      : {
          host: process.env.SUPABASE_DB_HOST || process.env.SQL_HOST || 'localhost',
          port: Number(process.env.SUPABASE_DB_PORT || process.env.SQL_PORT || 5432),
          user: process.env.SUPABASE_DB_USER || process.env.SQL_USER || 'postgres',
          password: process.env.SUPABASE_DB_PASSWORD || process.env.SQL_PASSWORD,
          database: process.env.SUPABASE_DB_NAME || process.env.SQL_DB_NAME || 'postgres',
          ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
          max: 10,
          connectionTimeoutMillis: 15000,
          idleTimeoutMillis: 30000,
        };

    global._postgresPool = new Pool(poolConfig);

    global._postgresPool.on('error', (err) => {
      console.error('[EduTrack Database] Unexpected error on idle client:', err.message);
    });
  }

  return global._postgresPool;
};

export const pool = createPool();
export const db = drizzle(pool, { schema });

/**
 * Health check helper to verify database connectivity.
 */
export async function checkDbConnection(): Promise<{
  connected: boolean;
  message: string;
  source: string;
  latencyMs?: number;
}> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      const latencyMs = Date.now() - start;
      const isSupabase = Boolean(
        process.env.DATABASE_URL?.includes('supabase') ||
        process.env.SUPABASE_URL ||
        process.env.SUPABASE_DB_HOST?.includes('supabase')
      );
      return {
        connected: true,
        message: 'Successfully connected to database',
        source: isSupabase ? 'Supabase PostgreSQL' : 'Local/Cloud PostgreSQL',
        latencyMs,
      };
    } finally {
      client.release();
    }
  } catch (error: any) {
    return {
      connected: false,
      message: error?.message || 'Database connection error',
      source: 'Unknown / Not connected',
    };
  }
}
=======
export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
>>>>>>> daa60db0deb6cc4182499fc087d4e9f119aec75d
