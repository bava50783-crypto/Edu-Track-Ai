import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

<<<<<<< HEAD
const connectionString =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL;

const isSupabase =
  Boolean(connectionString?.includes('supabase')) ||
  Boolean(process.env.SUPABASE_URL) ||
  process.env.DB_SSL === 'true';
=======
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!sqlHost) {
  throw new Error('SQL_HOST must be set in environment variables.');
}
if (!sqlDbName) {
  throw new Error('SQL_DB_NAME must be set in environment variables.');
}
if (!user) {
  throw new Error('SQL_ADMIN_USER must be set in environment variables.');
}
if (!password) {
  throw new Error('SQL_ADMIN_PASSWORD must be set in environment variables.');
}
>>>>>>> daa60db0deb6cc4182499fc087d4e9f119aec75d

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  schemaFilter: ['public'],
<<<<<<< HEAD
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
=======
  dbCredentials: {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false,
  },
>>>>>>> daa60db0deb6cc4182499fc087d4e9f119aec75d
  verbose: true,
});
