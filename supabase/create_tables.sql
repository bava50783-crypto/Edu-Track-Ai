-- =============================================================================
-- EduTrack AI – Complete Single Query to Create All Tables & Seed Data
-- Run this entire script in Supabase: Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLE DEFINITIONS (All 11 Tables)
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    uid TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    instructor TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'Section A',
    completion_pct INTEGER NOT NULL DEFAULT 0,
    enrolled_count INTEGER NOT NULL DEFAULT 45,
    color_hex TEXT NOT NULL DEFAULT '#414cce',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id SERIAL PRIMARY KEY,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    instructor TEXT NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    due_label TEXT NOT NULL,
    countdown_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'Normal',
    weight_pct INTEGER NOT NULL DEFAULT 15,
    estimated_mins INTEGER NOT NULL DEFAULT 60,
    grace_remaining TEXT,
    score TEXT,
    submitted_file_name TEXT,
    rubric_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_hint TEXT,
    user_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id SERIAL PRIMARY KEY,
    department TEXT NOT NULL,
    author TEXT NOT NULL,
    author_role TEXT NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    audience TEXT NOT NULL DEFAULT 'All Enrolled Students',
    course_ref TEXT NOT NULL DEFAULT 'GENERAL',
    tags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    body TEXT NOT NULL,
    session_title TEXT,
    session_time TEXT,
    session_room TEXT,
    seat_student_id TEXT,
    seat_row TEXT,
    seat_station TEXT,
    proctor TEXT,
    permitted_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    prohibited_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    attachments_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    starred BOOLEAN NOT NULL DEFAULT FALSE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    published_label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Study Documents Table
CREATE TABLE IF NOT EXISTS public.study_documents (
    id SERIAL PRIMARY KEY,
    course_code TEXT NOT NULL,
    department TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_label TEXT NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 12,
    raw_content TEXT NOT NULL,
    summary_json JSONB NOT NULL,
    user_uid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id SERIAL PRIMARY KEY,
    user_uid TEXT,
    title TEXT NOT NULL,
    course_scope_json JSONB NOT NULL DEFAULT '["CS301", "MATH240", "BIO110", "ENG205"]'::jsonb,
    deep_reasoning BOOLEAN NOT NULL DEFAULT TRUE,
    date_label TEXT NOT NULL DEFAULT 'Today',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    badge_label TEXT,
    time_label TEXT NOT NULL DEFAULT 'Just now',
    code_snippet TEXT,
    gotcha_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Study Goals Table
CREATE TABLE IF NOT EXISTS public.study_goals (
    id SERIAL PRIMARY KEY,
    user_uid TEXT NOT NULL UNIQUE,
    target_hours INTEGER NOT NULL DEFAULT 25,
    logged_tenths INTEGER NOT NULL DEFAULT 185,
    daily_hours_json JSONB NOT NULL DEFAULT '[3.2, 4.1, 4.0, 2.8, 1.6, 1.4, 1.4]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Waiver Requests Table
CREATE TABLE IF NOT EXISTS public.waiver_requests (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    assignment_title TEXT NOT NULL,
    reason TEXT NOT NULL,
    requested_hours INTEGER NOT NULL DEFAULT 48,
    status TEXT NOT NULL DEFAULT 'pending',
    received_label TEXT NOT NULL DEFAULT 'Received 2h ago',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Discussion Threads Table
CREATE TABLE IF NOT EXISTS public.discussion_threads (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    initials TEXT NOT NULL,
    course_code TEXT NOT NULL,
    thread_number TEXT NOT NULL,
    question TEXT NOT NULL,
    ai_draft TEXT,
    reply_text TEXT,
    replies_count INTEGER NOT NULL DEFAULT 0,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    time_ago TEXT NOT NULL DEFAULT '18m ago',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Faculty Schedule Table
CREATE TABLE IF NOT EXISTS public.faculty_schedule (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    time_range TEXT NOT NULL,
    location TEXT NOT NULL,
    badge_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);
CREATE INDEX IF NOT EXISTS idx_assignments_user_uid ON public.assignments(user_uid);
CREATE INDEX IF NOT EXISTS idx_assignments_course_code ON public.assignments(course_code);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(pinned);
CREATE INDEX IF NOT EXISTS idx_study_documents_user_uid ON public.study_documents(user_uid);
CREATE INDEX IF NOT EXISTS idx_study_documents_course_code ON public.study_documents(course_code);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_uid ON public.chat_sessions(user_uid);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_study_goals_user_uid ON public.study_goals(user_uid);
CREATE INDEX IF NOT EXISTS idx_discussion_threads_course_code ON public.discussion_threads(course_code);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiver_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_schedule ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "service_role_all_users" ON public.users;
    DROP POLICY IF EXISTS "allow_all_read_users" ON public.users;
    DROP POLICY IF EXISTS "allow_all_write_users" ON public.users;
    CREATE POLICY "service_role_all_users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_users" ON public.users FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_courses" ON public.courses;
    DROP POLICY IF EXISTS "allow_all_read_courses" ON public.courses;
    DROP POLICY IF EXISTS "allow_all_write_courses" ON public.courses;
    CREATE POLICY "service_role_all_courses" ON public.courses FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_courses" ON public.courses FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_assignments" ON public.assignments;
    DROP POLICY IF EXISTS "allow_all_read_assignments" ON public.assignments;
    DROP POLICY IF EXISTS "allow_all_write_assignments" ON public.assignments;
    CREATE POLICY "service_role_all_assignments" ON public.assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_assignments" ON public.assignments FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_assignments" ON public.assignments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_announcements" ON public.announcements;
    DROP POLICY IF EXISTS "allow_all_read_announcements" ON public.announcements;
    DROP POLICY IF EXISTS "allow_all_write_announcements" ON public.announcements;
    CREATE POLICY "service_role_all_announcements" ON public.announcements FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_announcements" ON public.announcements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_documents" ON public.study_documents;
    DROP POLICY IF EXISTS "allow_all_read_documents" ON public.study_documents;
    DROP POLICY IF EXISTS "allow_all_write_documents" ON public.study_documents;
    CREATE POLICY "service_role_all_documents" ON public.study_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_documents" ON public.study_documents FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_documents" ON public.study_documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_chat_sessions" ON public.chat_sessions;
    DROP POLICY IF EXISTS "allow_all_read_chat_sessions" ON public.chat_sessions;
    DROP POLICY IF EXISTS "allow_all_write_chat_sessions" ON public.chat_sessions;
    CREATE POLICY "service_role_all_chat_sessions" ON public.chat_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_chat_sessions" ON public.chat_sessions FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_chat_sessions" ON public.chat_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_chat_messages" ON public.chat_messages;
    DROP POLICY IF EXISTS "allow_all_read_chat_messages" ON public.chat_messages;
    DROP POLICY IF EXISTS "allow_all_write_chat_messages" ON public.chat_messages;
    CREATE POLICY "service_role_all_chat_messages" ON public.chat_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_chat_messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_chat_messages" ON public.chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_study_goals" ON public.study_goals;
    DROP POLICY IF EXISTS "allow_all_read_study_goals" ON public.study_goals;
    DROP POLICY IF EXISTS "allow_all_write_study_goals" ON public.study_goals;
    CREATE POLICY "service_role_all_study_goals" ON public.study_goals FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_study_goals" ON public.study_goals FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_study_goals" ON public.study_goals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_waivers" ON public.waiver_requests;
    DROP POLICY IF EXISTS "allow_all_read_waivers" ON public.waiver_requests;
    DROP POLICY IF EXISTS "allow_all_write_waivers" ON public.waiver_requests;
    CREATE POLICY "service_role_all_waivers" ON public.waiver_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_waivers" ON public.waiver_requests FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_waivers" ON public.waiver_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_discussions" ON public.discussion_threads;
    DROP POLICY IF EXISTS "allow_all_read_discussions" ON public.discussion_threads;
    DROP POLICY IF EXISTS "allow_all_write_discussions" ON public.discussion_threads;
    CREATE POLICY "service_role_all_discussions" ON public.discussion_threads FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_discussions" ON public.discussion_threads FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_discussions" ON public.discussion_threads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "service_role_all_faculty_schedule" ON public.faculty_schedule;
    DROP POLICY IF EXISTS "allow_all_read_schedule" ON public.faculty_schedule;
    DROP POLICY IF EXISTS "allow_all_write_schedule" ON public.faculty_schedule;
    CREATE POLICY "service_role_all_faculty_schedule" ON public.faculty_schedule FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "allow_all_read_schedule" ON public.faculty_schedule FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "allow_all_write_schedule" ON public.faculty_schedule FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- Optional Realtime Publication Setup
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.assignments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.discussion_threads;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- =============================================================================
-- 4. INITIAL SEED DATA
-- =============================================================================

-- 1. Courses
INSERT INTO public.courses (code, name, department, instructor, section, completion_pct, enrolled_count, color_hex)
VALUES
  ('CS301', 'Distributed Systems', 'Computer Science', 'Dr. Aris Thorne', 'Section A • 48 Students', 70, 94, '#414cce'),
  ('MATH240', 'Linear Algebra', 'Mathematics', 'Prof. Elena Vance', 'Section A • 62 Students', 85, 62, '#5c4bc3'),
  ('BIO110', 'Cell Biology', 'Biological Sciences', 'Dr. Marcus Webb', 'Section C • 54 Students', 50, 54, '#28A879'),
  ('ENG205', 'Technical Writing', 'Humanities & Comm.', 'Prof. Ronald Kim', 'Section B • 32 Students', 90, 32, '#F3B64A'),
  ('CS450', 'Cloud Native Microservices', 'Computer Science', 'Dr. Aris Thorne', 'Section B • 36 Students', 100, 48, '#5b67e8')
ON CONFLICT (code) DO NOTHING;

-- 2. Assignments
INSERT INTO public.assignments (
  course_code, course_name, instructor, title, subtitle, description,
  due_label, countdown_label, status, priority, weight_pct, estimated_mins,
  grace_remaining, score, submitted_file_name, rubric_json, ai_hint
)
VALUES
(
  'CS301',
  'Distributed Systems',
  'Dr. Aris Thorne',
  'Distributed Consensus & Raft Protocol',
  'Python / Go test suite',
  'Implement Raft leader election, randomized election timeouts, persistent state log entries, and split-brain partition recovery across a 5-node cluster.',
  'Mar 24, 11:59 PM',
  '1 Day Overdue',
  'overdue',
  'High',
  20,
  75,
  '23h 14m left',
  NULL,
  NULL,
  '[
    {"id": "r1", "label": "Heartbeat RPC protocol message handling (25 pts)", "points": 25, "earned": 25, "met": true},
    {"id": "r2", "label": "Persistent log store write-ahead logging (25 pts)", "points": 25, "earned": 25, "met": true},
    {"id": "r3", "label": "AppendEntries concurrency test suites (30 pts)", "points": 30, "earned": 30, "met": true},
    {"id": "r4", "label": "Cluster partition recovery simulation (20 pts)", "points": 20, "earned": 0, "met": false}
  ]'::jsonb,
  'Your local unit tests failed on Leader Election split-brain edge cases. Review Section 5.2 of Ongaro''s Raft paper before re-submitting.'
),
(
  'MATH240',
  'Linear Algebra',
  'Prof. Elena Vance',
  'Eigenvectors & Diagonalization',
  'Proof exercises Sec 5.3',
  'Complete orthogonal diagonalization proofs for symmetric matrices and spectral decomposition exercises 1–14.',
  'Mar 28, 5:00 PM',
  'Due in 2 days',
  'pending',
  'Medium',
  15,
  60,
  NULL,
  NULL,
  NULL,
  '[
    {"id": "m1", "label": "Characteristic polynomial derivation (30 pts)", "points": 30, "earned": 30, "met": true},
    {"id": "m2", "label": "Eigenspace basis normalization (35 pts)", "points": 35, "earned": 0, "met": false},
    {"id": "m3", "label": "Spectral theorem proof write-up (35 pts)", "points": 35, "earned": 0, "met": false}
  ]'::jsonb,
  'Remember that distinct eigenvalues of a real symmetric matrix always yield mutually orthogonal eigenvectors.'
),
(
  'BIO110',
  'Cell Biology',
  'Dr. Marcus Webb',
  'Cellular Energy Dynamics Lab',
  'Spectrophotometry analysis',
  'Analyze NADH absorbance curves across mitochondrial electron transport inhibitors and plot Michaelis-Menten kinetics.',
  'Apr 02, 11:59 PM',
  '7 Days Left',
  'pending',
  'Normal',
  12,
  50,
  NULL,
  NULL,
  NULL,
  '[
    {"id": "b1", "label": "Spectrophotometer calibration curve (25 pts)", "points": 25, "earned": 25, "met": true},
    {"id": "b2", "label": "ATP yield stoichiometry table (40 pts)", "points": 40, "earned": 0, "met": false},
    {"id": "b3", "label": "Inhibitor mechanism discussion (35 pts)", "points": 35, "earned": 0, "met": false}
  ]'::jsonb,
  'Compare your rotenone control slope against baseline pyruvate oxidation before exporting CSV graphs.'
),
(
  'ENG205',
  'Technical Writing',
  'Prof. Ronald Kim',
  'Modernist Poetics & Thesis Draft',
  'Draft 2 of 3',
  'Peer assessment and structural revision of your 2,400-word technical systems monograph with IEEE citation audit.',
  'Mar 30, 11:59 PM',
  '4 Days Left',
  'pending',
  'Medium',
  10,
  40,
  NULL,
  NULL,
  NULL,
  '[
    {"id": "e1", "label": "Executive abstract clarity (30 pts)", "points": 30, "earned": 30, "met": true},
    {"id": "e2", "label": "Peer critique rubric annotations (40 pts)", "points": 40, "earned": 40, "met": true},
    {"id": "e3", "label": "IEEE citation formatting audit (30 pts)", "points": 30, "earned": 0, "met": false}
  ]'::jsonb,
  'Focus peer feedback on abstract conciseness and active voice in methodology paragraphs.'
),
(
  'CS450',
  'Cloud Native Microservices',
  'Dr. Aris Thorne',
  'Service Mesh & Istio Routing Lab',
  'Kubernetes manifests',
  'Configure canary traffic shifting, circuit breakers, and mTLS telemetry.',
  'Mar 18, 11:59 PM',
  'Graded',
  'completed',
  'Normal',
  18,
  90,
  NULL,
  '95/100',
  'istio_canary_bundle.tar.gz',
  '[
    {"id": "c1", "label": "VirtualService weight split (40 pts)", "points": 40, "earned": 40, "met": true},
    {"id": "c2", "label": "DestinationRule circuit breaker (35 pts)", "points": 35, "earned": 35, "met": true},
    {"id": "c3", "label": "Prometheus canary telemetry (25 pts)", "points": 25, "earned": 20, "met": true}
  ]'::jsonb,
  'All Envoy sidecar health checks passed with zero 503 retries.'
);

-- 3. Announcements
INSERT INTO public.announcements (
  department, author, author_role, title, excerpt, category, priority,
  audience, course_ref, tags_json, body, session_title, session_time, session_room,
  seat_student_id, seat_row, seat_station, proctor, permitted_json, prohibited_json,
  attachments_json, pinned, starred, is_read, acknowledged, published_label
)
VALUES
(
  'Dept of Computer Science',
  'Dr. Aris Thorne',
  'CS Dept Head',
  'Midterm Examination Schedule & Seating Allocation Released',
  'Exam room assignments and seating matrices are now finalized for CS301 and CS450. Please check your assigned...',
  'Urgent Alert',
  'High Priority / Mandatory',
  'Audience: All CS Undergraduates',
  'Course Ref: CS-2025-S',
  '["Action Required", "CS301", "CS450"]'::jsonb,
  'Please review the finalized schedules, venue allocations, and technical integrity requirements for the upcoming Spring 2025 midterm examinations. All registered students in CS301 (Data Structures & Algorithms) and CS450 (Distributed Systems) must report to their assigned hall 15 minutes before the exam begins with a verified institutional photo ID.',
  'CS301 Midterm Examination',
  'Thursday, March 27, 2025 • 10:00 AM - 12:30 PM EST',
  'Turing Hall 101',
  '#EDU-9942',
  'Row C • Seat 14',
  'Dell OptiPlex (Secure OS v4.2)',
  'Prof. Katherine Ellis',
  '["One 8.5\" x 11\" double-sided handwritten cheat sheet.", "Approved non-programmable scientific calculator (TI-30X or equivalent).", "Dark blue or black ballpoint pens, pencils, and erasers.", "Standard university water bottle (clear plastic, no labels)."]'::jsonb,
  '["Mobile phones, smartwatches, fitness trackers, and earbuds.", "Programmable or graphing calculators (TI-84, TI-Nspire, etc.).", "Loose blank scratch paper (all draft booklets are provided by proctors).", "Any form of communication with peers inside the examination room."]'::jsonb,
  '[
    {"name": "CS301_Midterm_Seat_Roster_S25.pdf", "size": "1.8 MB", "kind": "Official PDF"},
    {"name": "Academic_Integrity_Honor_Code.pdf", "size": "420 KB", "kind": "Policy Document"}
  ]'::jsonb,
  true,
  true,
  false,
  false,
  'Mar 24, 2025'
),
(
  'Facilities & Operations Management',
  'Campus Operations Office',
  'Facility Operations',
  'Main Library 3rd Floor East Wing Quiet Pods Maintenance Closure',
  'HVAC ductwork maintenance will take place this Wednesday. The individual study pods 301-324 will remain closed...',
  'Facility Notice',
  'Normal',
  'Audience: Campus Wide',
  'FAC-LIB-2025',
  '["Facilities", "Quiet Study"]'::jsonb,
  'Due to planned ventilation filtration upgrades, third-floor individual study carrels will be unavailable from 07:00 to 19:00 on Wednesday, March 26. Alternative quiet study areas with dedicated power outlets are available in Ada Lovelace Building 2nd floor commons and Franklin Science Library.',
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  false, false, true, false,
  'Mar 23, 2025'
),
(
  'Academic Affairs Directorate',
  'Dean of Studies Office',
  'University Registrar',
  'Course Withdrawal Deadline Extended for Spring 2025 Semester',
  'The Faculty Senate has approved an emergency 72-hour extension for non-punitive course withdrawals...',
  'Policy Advisory',
  'Important Notice',
  'Audience: All Undergraduate Students',
  'ACAD-REG-25',
  '["Academic Policy", "Registrar"]'::jsonb,
  'The academic drop deadline without punitive GPA recording has been shifted to Friday, April 4 at 17:00 EST. Students considering course load reduction are strongly advised to confer with their assigned academic faculty advisors before submitting signed change-of-enrollment petitions.',
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  false, false, false, false,
  'Mar 22, 2025'
),
(
  'AI & Robotics Student Chapter',
  'AI Research Colloquium',
  'Invited Seminar Series',
  'Guest Lecture: Scalable Consensus Models with Distributed AI Systems',
  'Join visiting researchers for a live seminar in Turing Hall auditorium with hands-on breakout discussions on fault tolerance...',
  'Keynote Seminar',
  'Normal',
  'Audience: CS & Engineering Majors',
  'SEM-CS-402',
  '["Event", "Guest Speaker"]'::jsonb,
  'This Thursday evening seminar explores deterministic state machine replication under high-throughput ML inference clusters, connecting classic Raft/Paxos guarantees to modern GPU parameter servers. Extra credit attendance tokens will be scanned at the auditorium entrance.',
  'Keynote Seminar & Live Q&A',
  'Thursday, March 27 • 5:30 PM – 7:00 PM',
  'Turing Auditorium',
  NULL, NULL, NULL, NULL,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  false, false, true, false,
  'Mar 20, 2025'
),
(
  'Faculty of Computer Science • SysAdmin',
  'Compute Infrastructure Team',
  'Systems Engineering',
  'Lab Server Maintenance: Compute Cluster 3 Offline Saturday Midnight',
  'Scheduled kernel upgrades and GPU cluster sync. Save all long-running simulation checkpoints before 11:30 PM...',
  'Infrastructure',
  'Normal',
  'Audience: Lab Cluster Users',
  'SYS-CLUSTER-03',
  '["Maintenance", "Tech Notice"]'::jsonb,
  'Engineering Lab Compute Cluster 3 (nodes c3-01 through c3-16) will be offline Saturday from 12:00 AM to 4:00 AM for security kernel patching and NVMe storage rebalancing. All active Docker containers and distributed Raft simulation pods should be checkpointed beforehand.',
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  false, false, true, false,
  'Mar 18, 2025'
);

-- 4. Study Documents
INSERT INTO public.study_documents (
  course_code, department, file_name, file_size_label, page_count, raw_content, summary_json
)
VALUES
(
  'CS301',
  'Computer Science',
  'CS301_Distributed_Systems_Midterm_Review.pdf',
  '2.4 MB',
  18,
  'Distributed consensus algorithms allow a network of nodes to agree on values even in the presence of unreliable network channels and node crashes. The Raft protocol organizes consensus via leader election, log replication, and safety invariants. In leader election, randomized election timers prevent split votes. When a follower times out, it increments its currentTerm and transitions to candidate. Log entries flow strictly from leader to followers through AppendEntries RPCs. State machine safety dictates that if a server applies an entry at index i, no other server will apply a different entry at index i.',
  '{
    "confidence": "98.4%",
    "readingTime": "14 min read",
    "executiveOverview": "This document consolidates core distributed consensus paradigms with heavy emphasis on the Raft protocol invariants: leader election, persistent term logging, and split-brain recovery.",
    "keyConcepts": [
      {
        "kicker": "Core Concept 01",
        "title": "Randomized Election Timeouts",
        "description": "Nodes initiate randomized countdowns (150ms-300ms) before transitioning to Candidate state, avoiding perpetual split-vote stalemates in symmetric topologies.",
        "section": "Section 2.1 • Leader Election"
      },
      {
        "kicker": "Core Concept 02",
        "title": "Log Matching Property",
        "description": "If two logs contain an entry with the same index and term, then they store identical commands and their logs are identical in all preceding entries.",
        "section": "Section 3.4 • Log Replication"
      },
      {
        "kicker": "Core Concept 03",
        "title": "Joint Consensus Configuration",
        "description": "Cluster reconfigurations require a transition period where decisions require majorities from both old and new configurations simultaneously.",
        "section": "Section 5.1 • Membership Changes"
      }
    ],
    "formulas": [
      {
        "title": "Cluster Quorum Requirement",
        "latex": "Q = \\lfloor \\frac{N}{2} \\rfloor + 1",
        "description": "Strict majority quorum needed to commit a log entry across N cluster nodes."
      },
      {
        "title": "Broadcast Time vs MTBF",
        "latex": "T_{broadcast} \\ll T_{election} \\ll MTBF",
        "description": "Timing hierarchy required for system stability and preventing spurious elections."
      }
    ],
    "checklist": [
      {
        "id": "c1",
        "title": "Verify Heartbeat RPC Interval",
        "detail": "Leader heartbeat interval must not exceed 50ms under typical cluster network latency.",
        "checked": true
      },
      {
        "id": "c2",
        "title": "Audit Term Monotonicity",
        "detail": "Reject any incoming RPC bearing a term strictly lower than node currentTerm.",
        "checked": false
      },
      {
        "id": "c3",
        "title": "Check Write-Ahead Disk Flushes",
        "detail": "State variables currentTerm and votedFor must hit non-volatile storage before replying to RequestVote.",
        "checked": true
      }
    ],
    "examTakeaway": "Master the proof of Leader Completeness: once a log entry is committed in a given term, that entry will be present in the logs of leaders for all higher terms."
  }'::jsonb
),
(
  'MATH240',
  'Mathematics',
  'MATH240_Linear_Algebra_Spectral_Theorem.pdf',
  '1.9 MB',
  14,
  'The Spectral Theorem asserts that any symmetric matrix with real entries is orthogonally diagonalizable. Furthermore, all eigenvalues of a real symmetric matrix are real numbers, and eigenvectors corresponding to distinct eigenvalues are mutually orthogonal. For a matrix A in R^{n x n}, there exists an orthogonal matrix P such that P^T A P = D, where D is a diagonal matrix containing the eigenvalues.',
  '{
    "confidence": "97.1%",
    "readingTime": "11 min read",
    "executiveOverview": "Rigorous treatment of symmetric matrices, spectral decompositions, and quadratic forms with applications to principal component analysis.",
    "keyConcepts": [
      {
        "kicker": "Concept 01",
        "title": "Orthogonal Diagonalizability",
        "description": "A matrix is orthogonally diagonalizable if and only if it is symmetric (A = A^T).",
        "section": "Chapter 7.1"
      },
      {
        "kicker": "Concept 02",
        "title": "Spectral Decomposition",
        "description": "Representation of A as a linear combination of mutually orthogonal projection matrices weighted by eigenvalues.",
        "section": "Chapter 7.2"
      }
    ],
    "formulas": [
      {
        "title": "Spectral Representation",
        "latex": "A = \\lambda_1 u_1 u_1^T + \\lambda_2 u_2 u_2^T + \\dots + \\lambda_n u_n u_n^T",
        "description": "Decomposition of symmetric A into rank-1 projection operators."
      }
    ],
    "checklist": [
      {
        "id": "mc1",
        "title": "Normalize eigenvector basis",
        "detail": "Use Gram-Schmidt when eigenspaces have multiplicity greater than 1.",
        "checked": true
      }
    ],
    "examTakeaway": "Always verify that P is orthonormal (columns have unit length and dot products are zero) before computing P D P^T."
  }'::jsonb
);

-- 5. Chat Sessions & Messages
INSERT INTO public.chat_sessions (id, title, course_scope_json, deep_reasoning, date_label)
VALUES (
  1,
  'Distributed Consensus & Raft Edge Cases',
  '["CS301", "MATH240", "BIO110", "ENG205"]'::jsonb,
  true,
  'Today'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.chat_messages (session_id, role, content, badge_label, time_label, code_snippet, gotcha_tip)
VALUES
(
  1,
  'user',
  'How does Raft prevent split-brain votes when three candidates request votes at the exact same millisecond?',
  NULL,
  '10:14 AM',
  NULL,
  NULL
),
(
  1,
  'assistant',
  'Raft resolves split-vote scenarios primarily through **Randomized Election Timeouts** (typically 150ms–300ms) and the **first-come, first-served** voting invariant within each term. If a split vote occurs where no candidate achieves a strict majority (\lfloor N/2 \rfloor + 1), each candidate times out independently at a distinct jittered interval and initiates the next term with an incremented term counter.',
  'CS301 • Distributed Systems',
  '10:15 AM',
  '// Randomized election timeout trigger
int timeout = baseTimeout + rand() % jitterRange;
startTimer(timeout);

void onTimeout() {
    currentTerm++;
    state = CANDIDATE;
    votedFor = selfNodeId;
    broadcastRequestVoteRPC();
}',
  'Common gotcha: Ensure you reset the election timer only upon receiving a valid AppendEntries from current leader or granting a vote to another candidate — not on receiving an unverified RequestVote with an older term.'
);

-- 6. Study Goals
INSERT INTO public.study_goals (user_uid, target_hours, logged_tenths, daily_hours_json)
VALUES (
  'default_student_uid',
  25,
  185,
  '[3.2, 4.1, 4.0, 2.8, 1.6, 1.4, 1.4]'::jsonb
)
ON CONFLICT (user_uid) DO NOTHING;

-- 7. Waiver Requests
INSERT INTO public.waiver_requests (student_name, course_code, assignment_title, reason, requested_hours, status, received_label)
VALUES
  ('Jordan Vance', 'CS301', 'Distributed Consensus & Raft Protocol', 'Medical emergency during midterm week; clinic note attached.', 48, 'pending', 'Received 2h ago'),
  ('Liam Chen', 'MATH240', 'Eigenvectors & Diagonalization', 'Attending IEEE Student Conference in Chicago.', 72, 'pending', 'Received 5h ago'),
  ('Sophia Martinez', 'BIO110', 'Cellular Energy Dynamics Lab', 'Lab spectrometer malfunction during Thursday block.', 24, 'approved', 'Approved yesterday');

-- 8. Discussion Threads
INSERT INTO public.discussion_threads (student_name, initials, course_code, thread_number, question, ai_draft, reply_text, replies_count, resolved, time_ago)
VALUES
(
  'Marcus Aurelius',
  'MA',
  'CS301',
  'Thread #142',
  'In problem 3.2, does the follower need to persist matchIndex to disk, or only commitIndex?',
  'Only currentTerm, votedFor, and log[] must be persisted before replying to RPCs. commitIndex and matchIndex can be recomputed volatilely upon restart.',
  NULL,
  3,
  false,
  '18m ago'
),
(
  'Aria Stark',
  'AS',
  'MATH240',
  'Thread #139',
  'Why do we need Gram-Schmidt if distinct eigenvalues already produce orthogonal eigenvectors?',
  'Gram-Schmidt is only required within a repeated eigenvalue eigenspace of geometric multiplicity > 1 to obtain an orthonormal basis.',
  'Exactly as the AI draft noted. When an eigenvalue has algebraic multiplicity > 1, Gram-Schmidt orthogonalizes vectors within that same eigenspace.',
  5,
  true,
  '2h ago'
);

-- 9. Faculty Schedule
INSERT INTO public.faculty_schedule (title, time_range, location, badge_text)
VALUES
  ('Office Hours – Distributed Systems', '10:00 AM - 12:00 PM', 'Turing 312 / Zoom', 'Walk-ins Welcome'),
  ('CS301 Lecture: Raft Consensus', '02:00 PM - 03:30 PM', 'Hall 101', 'Lecture'),
  ('Department Curriculum Meeting', '04:00 PM - 05:00 PM', 'Faculty Lounge', 'Internal');

-- =============================================================================
-- 5. SEQUENCE ALIGNMENT
-- =============================================================================
SELECT setval(pg_get_serial_sequence('public.chat_sessions', 'id'), coalesce(max(id), 1)) FROM public.chat_sessions;
SELECT setval(pg_get_serial_sequence('public.courses', 'id'), coalesce(max(id), 1)) FROM public.courses;
SELECT setval(pg_get_serial_sequence('public.assignments', 'id'), coalesce(max(id), 1)) FROM public.assignments;
SELECT setval(pg_get_serial_sequence('public.announcements', 'id'), coalesce(max(id), 1)) FROM public.announcements;
SELECT setval(pg_get_serial_sequence('public.study_documents', 'id'), coalesce(max(id), 1)) FROM public.study_documents;
SELECT setval(pg_get_serial_sequence('public.waiver_requests', 'id'), coalesce(max(id), 1)) FROM public.waiver_requests;
SELECT setval(pg_get_serial_sequence('public.discussion_threads', 'id'), coalesce(max(id), 1)) FROM public.discussion_threads;
SELECT setval(pg_get_serial_sequence('public.faculty_schedule', 'id'), coalesce(max(id), 1)) FROM public.faculty_schedule;
