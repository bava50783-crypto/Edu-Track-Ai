import { asc, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  announcements,
  assignments,
  chatMessages,
  chatSessions,
  courses,
  discussionThreads,
  facultySchedule,
  studyDocuments,
  studyGoals,
  waiverRequests,
  type RubricCriterion,
  type StudyDocSummary,
} from './schema.ts';
import { ensureSeedData } from './seed.ts';

export async function getWorkspaceData(userUid: string) {
  try {
    await ensureSeedData(userUid);

    const [
      courseList,
      assignmentList,
      announcementList,
      documentList,
      sessionList,
      messageList,
      goalList,
      waiverList,
      discussionList,
      scheduleList,
    ] = await Promise.all([
      db.select().from(courses).orderBy(asc(courses.id)),
      db.select().from(assignments).orderBy(asc(assignments.id)),
      db.select().from(announcements).orderBy(desc(announcements.pinned), asc(announcements.id)),
      db.select().from(studyDocuments).orderBy(asc(studyDocuments.id)),
      db.select().from(chatSessions).orderBy(asc(chatSessions.id)),
      db.select().from(chatMessages).orderBy(asc(chatMessages.id)),
      db.select().from(studyGoals).where(eq(studyGoals.userUid, userUid)),
      db.select().from(waiverRequests).orderBy(asc(waiverRequests.id)),
      db.select().from(discussionThreads).orderBy(asc(discussionThreads.id)),
      db.select().from(facultySchedule).orderBy(asc(facultySchedule.id)),
    ]);

    let studyGoal = goalList[0];
    if (!studyGoal) {
      const [created] = await db
        .insert(studyGoals)
        .values({
          userUid,
          targetHours: 25,
          loggedTenths: 185,
          dailyHoursJson: [3.2, 4.1, 4.0, 2.8, 1.6, 1.4, 1.4],
        })
        .onConflictDoNothing()
        .returning();
      studyGoal = created || {
        id: 1,
        userUid,
        targetHours: 25,
        loggedTenths: 185,
        dailyHoursJson: [3.2, 4.1, 4.0, 2.8, 1.6, 1.4, 1.4],
        updatedAt: new Date(),
      };
    }

    const sessionsWithMessages = sessionList.map((s) => ({
      ...s,
      messages: messageList.filter((m) => m.sessionId === s.id),
    }));

    return {
      courses: courseList,
      assignments: assignmentList,
      announcements: announcementList,
      documents: documentList,
      chatSessions: sessionsWithMessages,
      studyGoal,
      waivers: waiverList,
      discussions: discussionList,
      facultySchedule: scheduleList,
    };
  } catch (error) {
    console.error('Database query failed in getWorkspaceData:', error);
    throw new Error('Failed to load workspace data from PostgreSQL.', { cause: error });
  }
}

export async function createAssignmentRecord(input: {
  courseCode: string;
  courseName: string;
  instructor: string;
  title: string;
  subtitle: string;
  description: string;
  dueLabel: string;
  countdownLabel: string;
  priority: string;
  weightPct: number;
  estimatedMins: number;
  userUid: string;
}) {
  try {
    const [created] = await db
      .insert(assignments)
      .values({
        ...input,
        status: 'pending',
        rubricJson: [
          { id: 'c1', label: 'Core implementation & correctness (50 pts)', points: 50, earned: 0, met: false },
          { id: 'c2', label: 'Edge case verification & write-up (50 pts)', points: 50, earned: 0, met: false },
        ],
        aiHint: `Review ${input.courseCode} lecture notes before submitting.`,
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Database query failed in createAssignmentRecord:', error);
    throw new Error('Failed to create assignment.', { cause: error });
  }
}

export async function updateAssignmentRecord(
  id: number,
  updates: {
    status?: string;
    rubricJson?: RubricCriterion[];
    submittedFileName?: string | null;
    countdownLabel?: string;
    score?: string | null;
  }
) {
  try {
    const [updated] = await db
      .update(assignments)
      .set(updates)
      .where(eq(assignments.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed in updateAssignmentRecord:', error);
    throw new Error('Failed to update assignment.', { cause: error });
  }
}

export async function createAnnouncementRecord(input: {
  department: string;
  author: string;
  authorRole: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  courseRef: string;
}) {
  try {
    const [created] = await db
      .insert(announcements)
      .values({
        department: input.department,
        author: input.author,
        authorRole: input.authorRole,
        title: input.title,
        excerpt: input.body.slice(0, 115) + (input.body.length > 115 ? '...' : ''),
        category: input.category,
        priority: input.priority,
        audience: 'Audience: Enrolled Students',
        courseRef: input.courseRef,
        tagsJson: [input.courseRef, input.category],
        body: input.body,
        pinned: input.category === 'Urgent Alert',
        starred: false,
        isRead: false,
        acknowledged: false,
        publishedLabel: 'Just now',
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Database query failed in createAnnouncementRecord:', error);
    throw new Error('Failed to publish announcement.', { cause: error });
  }
}

export async function updateAnnouncementRecord(
  id: number,
  updates: {
    starred?: boolean;
    isRead?: boolean;
    acknowledged?: boolean;
  }
) {
  try {
    const [updated] = await db
      .update(announcements)
      .set(updates)
      .where(eq(announcements.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed in updateAnnouncementRecord:', error);
    throw new Error('Failed to update announcement.', { cause: error });
  }
}

export async function markAllAnnouncementsRead() {
  try {
    await db.update(announcements).set({ isRead: true });
    return { ok: true };
  } catch (error) {
    console.error('Database query failed in markAllAnnouncementsRead:', error);
    throw new Error('Failed to mark announcements as read.', { cause: error });
  }
}

export async function createStudyDocumentRecord(input: {
  courseCode: string;
  department: string;
  fileName: string;
  fileSizeLabel: string;
  pageCount: number;
  rawContent: string;
  summaryJson: StudyDocSummary;
  userUid: string;
}) {
  try {
    const [created] = await db.insert(studyDocuments).values(input).returning();
    return created;
  } catch (error) {
    console.error('Database query failed in createStudyDocumentRecord:', error);
    throw new Error('Failed to store study document.', { cause: error });
  }
}

export async function updateStudyDocumentSummary(id: number, summaryJson: StudyDocSummary) {
  try {
    const [updated] = await db
      .update(studyDocuments)
      .set({ summaryJson })
      .where(eq(studyDocuments.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed in updateStudyDocumentSummary:', error);
    throw new Error('Failed to update document summary.', { cause: error });
  }
}

export async function deleteStudyDocumentRecord(id: number) {
  try {
    await db.delete(studyDocuments).where(eq(studyDocuments.id, id));
    return { ok: true };
  } catch (error) {
    console.error('Database query failed in deleteStudyDocumentRecord:', error);
    throw new Error('Failed to delete study document.', { cause: error });
  }
}

export async function createChatSessionRecord(input: {
  userUid: string;
  title: string;
  courseScopeJson: string[];
  deepReasoning: boolean;
}) {
  try {
    const [created] = await db
      .insert(chatSessions)
      .values({
        ...input,
        dateLabel: 'Today',
      })
      .returning();
    return { ...created, messages: [] };
  } catch (error) {
    console.error('Database query failed in createChatSessionRecord:', error);
    throw new Error('Failed to create chat session.', { cause: error });
  }
}

export async function addChatMessageRecord(input: {
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  badgeLabel?: string | null;
  timeLabel: string;
  codeSnippet?: string | null;
  gotchaTip?: string | null;
}) {
  try {
    const [created] = await db.insert(chatMessages).values(input).returning();
    return created;
  } catch (error) {
    console.error('Database query failed in addChatMessageRecord:', error);
    throw new Error('Failed to save chat message.', { cause: error });
  }
}

export async function updateStudyGoalRecord(
  userUid: string,
  updates: { targetHours?: number; loggedTenths?: number; dailyHoursJson?: number[] }
) {
  try {
    const [updated] = await db
      .update(studyGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(studyGoals.userUid, userUid))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed in updateStudyGoalRecord:', error);
    throw new Error('Failed to update study goal.', { cause: error });
  }
}

export async function updateWaiverStatus(id: number, status: 'approved' | 'rejected') {
  try {
    const [updated] = await db
      .update(waiverRequests)
      .set({ status })
      .where(eq(waiverRequests.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed in updateWaiverStatus:', error);
    throw new Error('Failed to update waiver request.', { cause: error });
  }
}

export async function updateDiscussionRecord(
  id: number,
  updates: { replyText?: string; resolved?: boolean; repliesCount?: number }
) {
  try {
    const [updated] = await db
      .update(discussionThreads)
      .set(updates)
      .where(eq(discussionThreads.id, id))
      .returning();
    return updated;
  } catch (error) {
    console.error('Database query failed in updateDiscussionRecord:', error);
    throw new Error('Failed to update discussion thread.', { cause: error });
  }
}
