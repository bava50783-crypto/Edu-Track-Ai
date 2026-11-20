import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

const isSupabase =
  Boolean(connectionString?.includes('supabase')) ||
  Boolean(process.env.SUPABASE_URL) ||
  process.env.DB_SSL === 'true';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
  dbCredentials: connectionString
    ? {
        url: connectionString,
        ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
      }
    : {
        host: process.env.SUPABASE_DB_HOST || process.env.SQL_HOST || 'localhost',
        port: Number(process.env.SUPABASE_DB_PORT || process.env.SQL_PORT || 5432),
        user: process.env.SUPABASE_DB_USER || process.env.SQL_ADMIN_USER || process.env.SQL_USER || 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD || process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD || '',
        database: process.env.SUPABASE_DB_NAME || process.env.SQL_DB_NAME || 'postgres',
        ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
      },
  verbose: true,
});
