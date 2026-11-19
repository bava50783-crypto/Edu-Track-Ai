import { relations } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export interface RubricCriterion {
  id: string;
  label: string;
  points: number;
  earned: number;
  met: boolean;
}

export interface StudyDocSummary {
  confidence: string;
  readingTime: string;
  executiveOverview: string;
  keyConcepts: Array<{
    kicker: string;
    title: string;
    description: string;
    section: string;
  }>;
  formulas: Array<{
    title: string;
    latex: string;
    description: string;
  }>;
  checklist: Array<{
    id: string;
    title: string;
    detail: string;
    checked: boolean;
  }>;
  examTakeaway: string;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('student'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  instructor: text('instructor').notNull(),
  section: text('section').notNull().default('Section A'),
  completionPct: integer('completion_pct').notNull().default(0),
  enrolledCount: integer('enrolled_count').notNull().default(45),
  colorHex: text('color_hex').notNull().default('#414cce'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  courseCode: text('course_code').notNull(),
  courseName: text('course_name').notNull(),
  instructor: text('instructor').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  description: text('description').notNull(),
  dueLabel: text('due_label').notNull(),
  countdownLabel: text('countdown_label').notNull(),
  status: text('status').notNull().default('pending'), // pending | completed | overdue
  priority: text('priority').notNull().default('Normal'), // Urgent | High | Medium | Normal
  weightPct: integer('weight_pct').notNull().default(15),
  estimatedMins: integer('estimated_mins').notNull().default(60),
  graceRemaining: text('grace_remaining'),
  score: text('score'),
  submittedFileName: text('submitted_file_name'),
  rubricJson: jsonb('rubric_json').$type<RubricCriterion[]>().notNull().default([]),
  aiHint: text('ai_hint'),
  userUid: text('user_uid'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  department: text('department').notNull(),
  author: text('author').notNull(),
  authorRole: text('author_role').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  category: text('category').notNull(), // Urgent Alert | Facility Notice | Policy Advisory | Keynote Seminar | Infrastructure
  priority: text('priority').notNull().default('Normal'),
  audience: text('audience').notNull().default('All Enrolled Students'),
  courseRef: text('course_ref').notNull().default('GENERAL'),
  tagsJson: jsonb('tags_json').$type<string[]>().notNull().default([]),
  body: text('body').notNull(),
  sessionTitle: text('session_title'),
  sessionTime: text('session_time'),
  sessionRoom: text('session_room'),
  seatStudentId: text('seat_student_id'),
  seatRow: text('seat_row'),
  seatStation: text('seat_station'),
  proctor: text('proctor'),
  permittedJson: jsonb('permitted_json').$type<string[]>().notNull().default([]),
  prohibitedJson: jsonb('prohibited_json').$type<string[]>().notNull().default([]),
  attachmentsJson: jsonb('attachments_json').$type<Array<{ name: string; size: string; kind: string }>>().notNull().default([]),
  pinned: boolean('pinned').notNull().default(false),
  starred: boolean('starred').notNull().default(false),
  isRead: boolean('is_read').notNull().default(false),
  acknowledged: boolean('acknowledged').notNull().default(false),
  publishedLabel: text('published_label').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studyDocuments = pgTable('study_documents', {
  id: serial('id').primaryKey(),
  courseCode: text('course_code').notNull(),
  department: text('department').notNull(),
  fileName: text('file_name').notNull(),
  fileSizeLabel: text('file_size_label').notNull(),
  pageCount: integer('page_count').notNull().default(12),
  rawContent: text('raw_content').notNull(),
  summaryJson: jsonb('summary_json').$type<StudyDocSummary>().notNull(),
  userUid: text('user_uid'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid'),
  title: text('title').notNull(),
  courseScopeJson: jsonb('course_scope_json').$type<string[]>().notNull().default(['CS301', 'MATH240', 'BIO110', 'ENG205']),
  deepReasoning: boolean('deep_reasoning').notNull().default(true),
  dateLabel: text('date_label').notNull().default('Today'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id')
    .references(() => chatSessions.id, { onDelete: 'cascade' })
    .notNull(),
  role: text('role').notNull(), // user | assistant
  content: text('content').notNull(),
  badgeLabel: text('badge_label'),
  timeLabel: text('time_label').notNull().default('Just now'),
  codeSnippet: text('code_snippet'),
  gotchaTip: text('gotcha_tip'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studyGoals = pgTable('study_goals', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().unique(),
  targetHours: integer('target_hours').notNull().default(25),
  loggedTenths: integer('logged_tenths').notNull().default(185), // 18.5 hrs
  dailyHoursJson: jsonb('daily_hours_json').$type<number[]>().notNull().default([3.2, 4.1, 4.0, 2.8, 1.6, 1.4, 1.4]),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const waiverRequests = pgTable('waiver_requests', {
  id: serial('id').primaryKey(),
  studentName: text('student_name').notNull(),
  courseCode: text('course_code').notNull(),
  assignmentTitle: text('assignment_title').notNull(),
  reason: text('reason').notNull(),
  requestedHours: integer('requested_hours').notNull().default(48),
  status: text('status').notNull().default('pending'), // pending | approved | rejected
  receivedLabel: text('received_label').notNull().default('Received 2h ago'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const discussionThreads = pgTable('discussion_threads', {
  id: serial('id').primaryKey(),
  studentName: text('student_name').notNull(),
  initials: text('initials').notNull(),
  courseCode: text('course_code').notNull(),
  threadNumber: text('thread_number').notNull(),
  question: text('question').notNull(),
  aiDraft: text('ai_draft'),
  replyText: text('reply_text'),
  repliesCount: integer('replies_count').notNull().default(0),
  resolved: boolean('resolved').notNull().default(false),
  timeAgo: text('time_ago').notNull().default('18m ago'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const facultySchedule = pgTable('faculty_schedule', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  timeRange: text('time_range').notNull(),
  location: text('location').notNull(),
  badgeText: text('badge_text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));
