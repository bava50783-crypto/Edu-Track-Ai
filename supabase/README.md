# Supabase Database Setup for EduTrack AI

This folder contains the complete SQL file to set up all tables and seed data in your Supabase project in **1 step**.

---

## 📄 File: `create_tables.sql`

This single file contains everything needed:
- ✅ **11 Database Tables**:
  - `users`
  - `courses`
  - `assignments`
  - `announcements`
  - `study_documents`
  - `chat_sessions`
  - `chat_messages`
  - `study_goals`
  - `waiver_requests`
  - `discussion_threads`
  - `faculty_schedule`
- ✅ **Performance Indexes** for fast queries
- ✅ **Row Level Security (RLS)** policies configured
- ✅ **Realtime Publication** enabled for instant UI updates
- ✅ **Initial Demo Seed Data** pre-loaded with `ON CONFLICT DO NOTHING`

---

## 🚀 How to Run in Supabase (1 Minute)

1. Open **[create_tables.sql](file:///c:/Users/bavad/Downloads/Edu-Track-Ai-main/Edu-Track-Ai-main/supabase/create_tables.sql)**.
2. Copy the entire file (`Ctrl + A`, `Ctrl + C`).
3. Open your [Supabase Dashboard](https://supabase.com/dashboard).
4. In the left navigation bar, click on **SQL Editor** (`>_`).
5. Click **New query**, paste the SQL code, and click **Run** (`Ctrl + Enter`).
6. You will see `Success. No rows returned`. All tables are now created and seeded!

---

## 🔑 Connect to EduTrack AI Backend

In your Supabase project:
1. Go to **Project Settings** (gear icon) -> **Database**.
2. Under **Connection string**, select **URI** (port 6543 Transaction Pooler is recommended).
3. Copy the string and add it to your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
4. Under **Project Settings** -> **API**, copy your URL and Anon Key:
   ```env
   SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   VITE_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
5. Test your connection:
   ```bash
   curl http://localhost:3000/api/db/health
   ```
