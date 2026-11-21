import { count, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  announcements,
  assignments,
  chatMessages,
  chatSessions,
  courses,
  customerResponses,
  customers,
  discussionThreads,
  facultySchedule,
  studentAcademicRecords,
  studyDocuments,
  studyGoals,
  waiverRequests,
} from './schema.ts';
import {
  INITIAL_ACADEMIC_RECORDS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_CHAT_SESSIONS,
  INITIAL_COURSES,
  INITIAL_CUSTOMER_RESPONSES,
  INITIAL_CUSTOMERS,
  INITIAL_DISCUSSIONS,
  INITIAL_DOCUMENTS,
  INITIAL_FACULTY_SCHEDULE,
  INITIAL_STUDY_GOAL,
  INITIAL_WAIVERS,
} from '../data/initialData.ts';

export async function ensureSeedData(userUid: string) {
  try {
    const [{ value: courseCount }] = await db.select({ value: count() }).from(courses);
    if (courseCount === 0) {
      await db
        .insert(courses)
        .values(
          INITIAL_COURSES.map((c) => ({
            code: c.code,
            name: c.name,
            department: c.department,
            instructor: c.instructor,
            section: c.section,
            completionPct: c.completionPct,
            enrolledCount: c.enrolledCount,
            colorHex: c.colorHex,
          }))
        )
        .onConflictDoNothing();
    }

    const [{ value: assignCount }] = await db.select({ value: count() }).from(assignments);
    if (assignCount === 0) {
      await db.insert(assignments).values(
        INITIAL_ASSIGNMENTS.map((a) => ({
          courseCode: a.courseCode,
          courseName: a.courseName,
          instructor: a.instructor,
          title: a.title,
          subtitle: a.subtitle,
          description: a.description,
          dueLabel: a.dueLabel,
          countdownLabel: a.countdownLabel,
          status: a.status,
          priority: a.priority,
          weightPct: a.weightPct,
          estimatedMins: a.estimatedMins,
          graceRemaining: a.graceRemaining ?? null,
          score: a.score ?? null,
          submittedFileName: a.submittedFileName ?? null,
          rubricJson: a.rubricJson,
          aiHint: a.aiHint ?? null,
          userUid,
        }))
      );
    }

    const [{ value: annCount }] = await db.select({ value: count() }).from(announcements);
    if (annCount === 0) {
      await db.insert(announcements).values(
        INITIAL_ANNOUNCEMENTS.map((ann) => ({
          department: ann.department,
          author: ann.author,
          authorRole: ann.authorRole,
          title: ann.title,
          excerpt: ann.excerpt,
          category: ann.category,
          priority: ann.priority,
          audience: ann.audience,
          courseRef: ann.courseRef,
          tagsJson: ann.tagsJson,
          body: ann.body,
          sessionTitle: ann.sessionTitle ?? null,
          sessionTime: ann.sessionTime ?? null,
          sessionRoom: ann.sessionRoom ?? null,
          seatStudentId: ann.seatStudentId ?? null,
          seatRow: ann.seatRow ?? null,
          seatStation: ann.seatStation ?? null,
          proctor: ann.proctor ?? null,
          permittedJson: ann.permittedJson,
          prohibitedJson: ann.prohibitedJson,
          attachmentsJson: ann.attachmentsJson,
          pinned: ann.pinned,
          starred: ann.starred,
          isRead: ann.isRead,
          acknowledged: ann.acknowledged,
          publishedLabel: ann.publishedLabel,
        }))
      );
    }

    const [{ value: docCount }] = await db.select({ value: count() }).from(studyDocuments);
    if (docCount === 0) {
      await db.insert(studyDocuments).values(
        INITIAL_DOCUMENTS.map((doc) => ({
          courseCode: doc.courseCode,
          department: doc.department,
          fileName: doc.fileName,
          fileSizeLabel: doc.fileSizeLabel,
          pageCount: doc.pageCount,
          rawContent: doc.rawContent,
          summaryJson: doc.summaryJson,
          userUid,
        }))
      );
    }

    const [{ value: sessionCount }] = await db.select({ value: count() }).from(chatSessions);
    if (sessionCount === 0) {
      for (const s of INITIAL_CHAT_SESSIONS) {
        const [insertedSession] = await db
          .insert(chatSessions)
          .values({
            userUid,
            title: s.title,
            courseScopeJson: s.courseScopeJson,
            deepReasoning: s.deepReasoning,
            dateLabel: s.dateLabel,
          })
          .returning();

        if (insertedSession && s.messages.length > 0) {
          await db.insert(chatMessages).values(
            s.messages.map((m) => ({
              sessionId: insertedSession.id,
              role: m.role,
              content: m.content,
              badgeLabel: m.badgeLabel ?? null,
              timeLabel: m.timeLabel,
              codeSnippet: m.codeSnippet ?? null,
              gotchaTip: m.gotchaTip ?? null,
              navActionsJson: m.navActionsJson ?? [],
            }))
          );
        }
      }
    }

    const [{ value: goalCount }] = await db.select({ value: count() }).from(studyGoals);
    if (goalCount === 0) {
      await db
        .insert(studyGoals)
        .values({
          userUid,
          targetHours: INITIAL_STUDY_GOAL.targetHours,
          loggedTenths: INITIAL_STUDY_GOAL.loggedTenths,
          dailyHoursJson: INITIAL_STUDY_GOAL.dailyHoursJson,
        })
        .onConflictDoNothing();
    }

    const [{ value: waiverCount }] = await db.select({ value: count() }).from(waiverRequests);
    if (waiverCount === 0) {
      await db.insert(waiverRequests).values(
        INITIAL_WAIVERS.map((w) => ({
          studentName: w.studentName,
          courseCode: w.courseCode,
          assignmentTitle: w.assignmentTitle,
          reason: w.reason,
          requestedHours: w.requestedHours,
          status: w.status,
          receivedLabel: w.receivedLabel,
        }))
      );
    }

    const [{ value: discCount }] = await db.select({ value: count() }).from(discussionThreads);
    if (discCount === 0) {
      await db.insert(discussionThreads).values(
        INITIAL_DISCUSSIONS.map((d) => ({
          studentName: d.studentName,
          initials: d.initials,
          courseCode: d.courseCode,
          threadNumber: d.threadNumber,
          question: d.question,
          aiDraft: d.aiDraft ?? null,
          replyText: d.replyText ?? null,
          repliesCount: d.repliesCount,
          resolved: d.resolved,
          timeAgo: d.timeAgo,
        }))
      );
    }

    const [{ value: schedCount }] = await db.select({ value: count() }).from(facultySchedule);
    if (schedCount === 0) {
      await db.insert(facultySchedule).values(
        INITIAL_FACULTY_SCHEDULE.map((f) => ({
          title: f.title,
          timeRange: f.timeRange,
          location: f.location,
          badgeText: f.badgeText,
        }))
      );
    }

    const [{ value: custCount }] = await db.select({ value: count() }).from(customers);
    if (custCount === 0) {
      const insertedCustomers = await db
        .insert(customers)
        .values(
          INITIAL_CUSTOMERS.map((c) => ({
            name: c.name,
            email: c.email,
            organization: c.organization,
            roleTitle: c.roleTitle,
            tier: c.tier,
            phone: c.phone,
            status: c.status,
            userUid,
          }))
        )
        .returning();

      const idMap = new Map<number, number>();
      INITIAL_CUSTOMERS.forEach((c, idx) => {
        if (insertedCustomers[idx]) idMap.set(c.id, insertedCustomers[idx].id);
      });

      const [{ value: respCount }] = await db.select({ value: count() }).from(customerResponses);
      if (respCount === 0) {
        await db.insert(customerResponses).values(
          INITIAL_CUSTOMER_RESPONSES.map((r) => ({
            customerId: idMap.get(r.customerId) || insertedCustomers[0].id,
            subject: r.subject,
            queryText: r.queryText,
            responseText: r.responseText,
            status: r.status,
            priority: r.priority,
            channel: r.channel,
            assignedAgent: r.assignedAgent,
            historyJson: r.historyJson,
            respondedAt: r.respondedAt ? new Date(r.respondedAt) : null,
          }))
        );
      }
    }

    const [{ value: acadCount }] = await db
      .select({ value: count() })
      .from(studentAcademicRecords)
      .where(eq(studentAcademicRecords.userUid, userUid));
    if (acadCount === 0) {
      await db.insert(studentAcademicRecords).values(
        INITIAL_ACADEMIC_RECORDS.map((rec) => ({
          userUid,
          courseCode: rec.courseCode,
          courseName: rec.courseName,
          credits: rec.credits,
          marksPct: rec.marksPct,
          letterGrade: rec.letterGrade,
          gradePointsTenths: rec.gradePointsTenths,
          classesAttended: rec.classesAttended,
          totalClasses: rec.totalClasses,
          targetAttendancePct: rec.targetAttendancePct,
          timetableSlot: rec.timetableSlot,
        }))
      );
    }
  } catch (error) {
    console.error('Database query failed in ensureSeedData:', error);
    throw new Error('Failed to initialize workspace database.', { cause: error });
  }
}
