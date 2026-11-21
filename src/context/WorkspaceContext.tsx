import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
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
  type AnnouncementItem,
  type AssignmentItem,
  type ChatMessageItem,
  type ChatSessionItem,
  type CourseItem,
  type CustomerItem,
  type CustomerResponseItem,
  type DiscussionThreadItem,
  type FacultyScheduleItem,
  type StudentAcademicRecordItem,
  type StudyDocumentItem,
  type StudyGoalItem,
  type WaiverRequestItem,
} from '../data/initialData.ts';
import type { InteractionHistoryEntry, RubricCriterion, StudyDocSummary } from '../db/schema.ts';

export type NavTab =
  | 'dashboard'
  | 'customers'
  | 'responses'
  | 'chatbot'
  | 'analytics'
  | 'settings'
  | 'assignments'
  | 'announcements'
  | 'study-hub'
  | 'ai-assistant'
  | 'faculty';

interface WorkspaceContextValue {
  user: User | null;
  authLoading: boolean;
  dbSynced: boolean;
  syncing: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  activeNav: NavTab;
  setActiveNav: (tab: NavTab) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  selectedAssignmentId: number;
  setSelectedAssignmentId: (id: number) => void;
  selectedAnnouncementId: number;
  setSelectedAnnouncementId: (id: number) => void;
  selectedDocumentId: number;
  setSelectedDocumentId: (id: number) => void;
  activeSessionId: number;
  setActiveSessionId: (id: number) => void;
  selectedCustomerId: number;
  setSelectedCustomerId: (id: number) => void;
  selectedResponseId: number;
  setSelectedResponseId: (id: number) => void;
  courses: CourseItem[];
  assignments: AssignmentItem[];
  announcements: AnnouncementItem[];
  documents: StudyDocumentItem[];
  chatSessions: ChatSessionItem[];
  studyGoal: StudyGoalItem;
  waivers: WaiverRequestItem[];
  discussions: DiscussionThreadItem[];
  facultySchedule: FacultyScheduleItem[];
  customers: CustomerItem[];
  customerResponses: CustomerResponseItem[];
  academicRecords: StudentAcademicRecordItem[];
  toastMessage: string | null;
  toastType: 'success' | 'error';
  showToast: (msg: string, type?: 'success' | 'error') => void;
  updateAcademicAttendance: (id: number, classesAttended: number, totalClasses: number) => Promise<void>;
  // Customers & Responses CRUD
  createCustomer: (payload: Omit<CustomerItem, 'id' | 'createdAt'>) => Promise<CustomerItem>;
  updateCustomer: (id: number, updates: Partial<CustomerItem>) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  createCustomerResponse: (payload: {
    customerId: number;
    subject: string;
    queryText: string;
    responseText: string;
    status: 'Pending' | 'Responded' | 'Resolved';
    priority: 'High' | 'Medium' | 'Low';
    channel: 'Support Portal' | 'Email' | 'Live Chat';
    assignedAgent: string;
  }) => Promise<CustomerResponseItem>;
  updateCustomerResponse: (
    id: number,
    updates: {
      subject?: string;
      queryText?: string;
      responseText?: string;
      status?: 'Pending' | 'Responded' | 'Resolved';
      priority?: 'High' | 'Medium' | 'Low';
      channel?: 'Support Portal' | 'Email' | 'Live Chat';
      assignedAgent?: string;
      historyJson?: InteractionHistoryEntry[];
    }
  ) => Promise<void>;
  deleteCustomerResponse: (id: number) => Promise<void>;
  // Existing Academic OS Mutations
  createAssignment: (payload: Omit<AssignmentItem, 'id' | 'status' | 'rubricJson'>) => Promise<void>;
  toggleAssignmentComplete: (id: number) => Promise<void>;
  toggleRubricCriterion: (assignmentId: number, criterionId: string) => Promise<void>;
  submitAssignmentFile: (assignmentId: number, fileName: string) => Promise<void>;
  createAnnouncement: (payload: {
    department: string;
    author: string;
    authorRole: string;
    title: string;
    body: string;
    category: string;
    priority: string;
    courseRef: string;
  }) => Promise<void>;
  toggleAnnouncementStar: (id: number) => Promise<void>;
  markAnnouncementRead: (id: number) => Promise<void>;
  acknowledgeAnnouncement: (id: number) => Promise<void>;
  markAllAnnouncementsRead: () => Promise<void>;
  addStudyDocument: (doc: Omit<StudyDocumentItem, 'id'>) => Promise<StudyDocumentItem>;
  updateDocumentSummary: (id: number, summaryJson: StudyDocSummary) => Promise<void>;
  toggleDocChecklistItem: (docId: number, checkId: string) => Promise<void>;
  deleteStudyDocument: (id: number) => Promise<void>;
  createChatSession: (title: string, scope: string[], deepReasoning: boolean) => Promise<ChatSessionItem>;
  deleteChatSession: (id: number) => Promise<void>;
  appendChatMessage: (
    sessionId: number,
    msg: Omit<ChatMessageItem, 'id' | 'sessionId'>
  ) => Promise<void>;
  clearCurrentSessionMessages: (sessionId: number) => Promise<void>;
  logStudyHours: (hoursToAdd: number) => Promise<void>;
  resolveWaiver: (id: number, status: 'approved' | 'rejected') => Promise<void>;
  replyDiscussion: (id: number, replyText: string, resolved: boolean) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbSynced, setDbSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [activeNav, setActiveNav] = useState<NavTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number>(1);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number>(1);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number>(1);
  const [activeSessionId, setActiveSessionId] = useState<number>(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [selectedResponseId, setSelectedResponseId] = useState<number>(1);

  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(INITIAL_ASSIGNMENTS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [documents, setDocuments] = useState<StudyDocumentItem[]>(INITIAL_DOCUMENTS);
  const [chatSessions, setChatSessions] = useState<ChatSessionItem[]>(INITIAL_CHAT_SESSIONS);
  const [studyGoal, setStudyGoal] = useState<StudyGoalItem>(INITIAL_STUDY_GOAL);
  const [waivers, setWaivers] = useState<WaiverRequestItem[]>(INITIAL_WAIVERS);
  const [discussions, setDiscussions] = useState<DiscussionThreadItem[]>(INITIAL_DISCUSSIONS);
  const [facultySchedule, setFacultySchedule] = useState<FacultyScheduleItem[]>(INITIAL_FACULTY_SCHEDULE);
  const [customers, setCustomers] = useState<CustomerItem[]>(INITIAL_CUSTOMERS);
  const [customerResponses, setCustomerResponses] = useState<CustomerResponseItem[]>(INITIAL_CUSTOMER_RESPONSES);
  const [academicRecords, setAcademicRecords] = useState<StudentAcademicRecordItem[]>(INITIAL_ACADEMIC_RECORDS);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  }, []);

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    const token = await currentUser.getIdToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed (${res.status})`);
    }
    return res.json();
  }, []);

  const loadWorkspaceFromDb = useCallback(async () => {
    try {
      setSyncing(true);
      const data = await fetchWithAuth('/api/db/workspace');
      if (!data) return;
      if (data.courses?.length) setCourses(data.courses);
      if (data.assignments?.length) {
        setAssignments(data.assignments);
        setSelectedAssignmentId((prev) =>
          data.assignments.some((a: AssignmentItem) => a.id === prev) ? prev : data.assignments[0].id
        );
      }
      if (data.announcements?.length) {
        setAnnouncements(data.announcements);
        setSelectedAnnouncementId((prev) =>
          data.announcements.some((a: AnnouncementItem) => a.id === prev) ? prev : data.announcements[0].id
        );
      }
      if (data.documents?.length) {
        setDocuments(data.documents);
        setSelectedDocumentId((prev) =>
          data.documents.some((d: StudyDocumentItem) => d.id === prev) ? prev : data.documents[0].id
        );
      }
      if (data.chatSessions?.length) {
        setChatSessions(data.chatSessions);
        setActiveSessionId((prev) =>
          data.chatSessions.some((s: ChatSessionItem) => s.id === prev) ? prev : data.chatSessions[0].id
        );
      }
      if (data.studyGoal) setStudyGoal(data.studyGoal);
      if (data.waivers?.length) setWaivers(data.waivers);
      if (data.discussions?.length) setDiscussions(data.discussions);
      if (data.facultySchedule?.length) setFacultySchedule(data.facultySchedule);
      if (data.customers?.length) {
        setCustomers(data.customers);
        setSelectedCustomerId((prev) =>
          data.customers.some((c: CustomerItem) => c.id === prev) ? prev : data.customers[0].id
        );
      }
      if (data.customerResponses?.length) {
        setCustomerResponses(data.customerResponses);
        setSelectedResponseId((prev) =>
          data.customerResponses.some((r: CustomerResponseItem) => r.id === prev)
            ? prev
            : data.customerResponses[0].id
        );
      }
      if (data.academicRecords?.length) {
        setAcademicRecords(data.academicRecords);
      }
      setDbSynced(true);
    } catch (error: any) {
      console.error('Failed syncing workspace:', error);
      showToast(error.message || 'Database sync error', 'error');
    } finally {
      setSyncing(false);
    }
  }, [fetchWithAuth, showToast]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        loadWorkspaceFromDb();
      } else {
        setDbSynced(false);
      }
    });
    return () => unsub();
  }, [loadWorkspaceFromDb]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      showToast('Signed in and synced with PostgreSQL');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      showToast(error.message || 'Sign-in cancelled', 'error');
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setDbSynced(false);
    showToast('Signed out');
  }, [showToast]);

  // =========================================================================
  // CUSTOMERS & RESPONSES CRUD
  // =========================================================================

  const createCustomer = useCallback(
    async (payload: Omit<CustomerItem, 'id' | 'createdAt'>): Promise<CustomerItem> => {
      const tempId = Date.now();
      const optimistic: CustomerItem = {
        ...payload,
        id: tempId,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [optimistic, ...prev]);
      setSelectedCustomerId(tempId);

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth('/api/db/customers', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (saved) {
            setCustomers((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
            setSelectedCustomerId(saved.id);
            showToast(`Customer "${saved.name}" created and saved`);
            return saved;
          }
        } catch (err: any) {
          showToast(err.message || 'Failed saving customer', 'error');
          throw err;
        }
      }
      showToast(`Customer "${payload.name}" created`);
      return optimistic;
    },
    [fetchWithAuth, showToast]
  );

  const updateCustomer = useCallback(
    async (id: number, updates: Partial<CustomerItem>) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth(`/api/db/customers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
          });
          if (saved) {
            setCustomers((prev) => prev.map((c) => (c.id === id ? saved : c)));
          }
        } catch (err: any) {
          showToast(err.message || 'Failed updating customer', 'error');
          throw err;
        }
      }
      showToast('Customer profile updated');
    },
    [fetchWithAuth, showToast]
  );

  const deleteCustomer = useCallback(
    async (id: number) => {
      setCustomers((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (selectedCustomerId === id && next.length > 0) setSelectedCustomerId(next[0].id);
        return next;
      });
      setCustomerResponses((prev) => prev.filter((r) => r.customerId !== id));

      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/customers/${id}`, { method: 'DELETE' });
        } catch (err: any) {
          showToast(err.message || 'Failed deleting customer', 'error');
          throw err;
        }
      }
      showToast('Customer deleted');
    },
    [fetchWithAuth, selectedCustomerId, showToast]
  );

  const createCustomerResponse = useCallback(
    async (payload: {
      customerId: number;
      subject: string;
      queryText: string;
      responseText: string;
      status: 'Pending' | 'Responded' | 'Resolved';
      priority: 'High' | 'Medium' | 'Low';
      channel: 'Support Portal' | 'Email' | 'Live Chat';
      assignedAgent: string;
    }): Promise<CustomerResponseItem> => {
      const tempId = Date.now();
      const nowStr = new Date().toISOString();
      const cust = customers.find((c) => c.id === payload.customerId);
      const history: InteractionHistoryEntry[] = [
        {
          id: `h-${tempId}-1`,
          actor: cust?.name || 'Customer',
          role: 'customer',
          message: payload.queryText,
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        },
      ];
      if (payload.responseText.trim()) {
        history.push({
          id: `h-${tempId}-2`,
          actor: payload.assignedAgent,
          role: 'agent',
          message: payload.responseText,
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        });
      }

      const optimistic: CustomerResponseItem = {
        ...payload,
        id: tempId,
        historyJson: history,
        createdAt: nowStr,
        updatedAt: nowStr,
        respondedAt: payload.responseText.trim() ? nowStr : null,
      };
      setCustomerResponses((prev) => [optimistic, ...prev]);
      setSelectedResponseId(tempId);

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth('/api/db/responses', {
            method: 'POST',
            body: JSON.stringify({ ...payload, historyJson: history }),
          });
          if (saved) {
            setCustomerResponses((prev) => prev.map((r) => (r.id === tempId ? saved : r)));
            setSelectedResponseId(saved.id);
            showToast('Customer response created');
            return saved;
          }
        } catch (err: any) {
          showToast(err.message || 'Failed saving response', 'error');
          throw err;
        }
      }
      showToast('Customer response created');
      return optimistic;
    },
    [customers, fetchWithAuth, showToast]
  );

  const updateCustomerResponse = useCallback(
    async (
      id: number,
      updates: {
        subject?: string;
        queryText?: string;
        responseText?: string;
        status?: 'Pending' | 'Responded' | 'Resolved';
        priority?: 'High' | 'Medium' | 'Low';
        channel?: 'Support Portal' | 'Email' | 'Live Chat';
        assignedAgent?: string;
        historyJson?: InteractionHistoryEntry[];
      }
    ) => {
      const nowIso = new Date().toISOString();
      setCustomerResponses((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                ...updates,
                updatedAt: nowIso,
                ...(updates.status === 'Responded' || updates.status === 'Resolved'
                  ? { respondedAt: nowIso }
                  : {}),
              }
            : r
        )
      );

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth(`/api/db/responses/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
          });
          if (saved) {
            setCustomerResponses((prev) => prev.map((r) => (r.id === id ? saved : r)));
          }
        } catch (err: any) {
          showToast(err.message || 'Failed updating customer response', 'error');
          throw err;
        }
      }
      showToast('Customer response updated');
    },
    [fetchWithAuth, showToast]
  );

  const deleteCustomerResponse = useCallback(
    async (id: number) => {
      setCustomerResponses((prev) => {
        const remaining = prev.filter((r) => r.id !== id);
        if (selectedResponseId === id && remaining.length > 0) {
          setSelectedResponseId(remaining[0].id);
        }
        return remaining;
      });
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/responses/${id}`, { method: 'DELETE' });
        } catch (err: any) {
          showToast(err.message || 'Failed deleting customer response', 'error');
          throw err;
        }
      }
      showToast('Customer response deleted');
    },
    [fetchWithAuth, selectedResponseId, showToast]
  );

  // =========================================================================
  // ACADEMIC OS MUTATIONS
  // =========================================================================

  const createAssignment = useCallback(
    async (payload: Omit<AssignmentItem, 'id' | 'status' | 'rubricJson'>) => {
      const tempId = Date.now();
      const optimistic: AssignmentItem = {
        ...payload,
        id: tempId,
        status: 'pending',
        rubricJson: [
          { id: 'c1', label: 'Core implementation & correctness (50 pts)', points: 50, earned: 0, met: false },
          { id: 'c2', label: 'Edge case verification & write-up (50 pts)', points: 50, earned: 0, met: false },
        ],
      };
      setAssignments((prev) => [optimistic, ...prev]);
      setSelectedAssignmentId(tempId);

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth('/api/db/assignments', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (saved) {
            setAssignments((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
            setSelectedAssignmentId(saved.id);
          }
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast('Assignment created');
    },
    [fetchWithAuth, showToast]
  );

  const toggleAssignmentComplete = useCallback(
    async (id: number) => {
      const target = assignments.find((a) => a.id === id);
      if (!target) return;
      const nextStatus: 'completed' | 'pending' = target.status === 'completed' ? 'pending' : 'completed';
      const nextCountdown = nextStatus === 'completed' ? 'Completed' : 'Due soon';

      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: nextStatus, countdownLabel: nextCountdown } : a))
      );

      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/assignments/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: nextStatus, countdownLabel: nextCountdown }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    },
    [assignments, fetchWithAuth, showToast]
  );

  const toggleRubricCriterion = useCallback(
    async (assignmentId: number, criterionId: string) => {
      const target = assignments.find((a) => a.id === assignmentId);
      if (!target) return;
      const updatedRubric: RubricCriterion[] = target.rubricJson.map((r) =>
        r.id === criterionId ? { ...r, met: !r.met, earned: !r.met ? r.points : 0 } : r
      );

      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? { ...a, rubricJson: updatedRubric } : a))
      );

      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/assignments/${assignmentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ rubricJson: updatedRubric }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    },
    [assignments, fetchWithAuth, showToast]
  );

  const submitAssignmentFile = useCallback(
    async (assignmentId: number, fileName: string) => {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId
            ? {
                ...a,
                status: 'completed',
                countdownLabel: 'Submitted',
                submittedFileName: fileName,
                score: 'Pending Auto-Grade',
              }
            : a
        )
      );

      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/assignments/${assignmentId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              status: 'completed',
              countdownLabel: 'Submitted',
              submittedFileName: fileName,
              score: 'Pending Auto-Grade',
            }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast(`Submitted ${fileName}`);
    },
    [fetchWithAuth, showToast]
  );

  const createAnnouncement = useCallback(
    async (payload: {
      department: string;
      author: string;
      authorRole: string;
      title: string;
      body: string;
      category: string;
      priority: string;
      courseRef: string;
    }) => {
      const tempId = Date.now();
      const optimistic: AnnouncementItem = {
        id: tempId,
        department: payload.department,
        author: payload.author,
        authorRole: payload.authorRole,
        title: payload.title,
        excerpt: payload.body.slice(0, 115) + (payload.body.length > 115 ? '...' : ''),
        category: payload.category,
        priority: payload.priority,
        audience: 'Audience: Enrolled Students',
        courseRef: payload.courseRef,
        tagsJson: [payload.courseRef, payload.category],
        body: payload.body,
        permittedJson: [],
        prohibitedJson: [],
        attachmentsJson: [],
        pinned: payload.category === 'Urgent Alert',
        starred: false,
        isRead: false,
        acknowledged: false,
        publishedLabel: 'Just now',
      };
      setAnnouncements((prev) => [optimistic, ...prev]);
      setSelectedAnnouncementId(tempId);

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth('/api/db/announcements', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (saved) {
            setAnnouncements((prev) => prev.map((a) => (a.id === tempId ? saved : a)));
            setSelectedAnnouncementId(saved.id);
          }
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast('Announcement published');
    },
    [fetchWithAuth, showToast]
  );

  const toggleAnnouncementStar = useCallback(
    async (id: number) => {
      const target = announcements.find((a) => a.id === id);
      if (!target) return;
      const nextStar = !target.starred;
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, starred: nextStar } : a)));
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/announcements/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ starred: nextStar }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    },
    [announcements, fetchWithAuth, showToast]
  );

  const markAnnouncementRead = useCallback(
    async (id: number) => {
      const target = announcements.find((a) => a.id === id);
      if (!target || target.isRead) return;
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/announcements/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ isRead: true }),
          });
        } catch {
          // quiet
        }
      }
    },
    [announcements, fetchWithAuth]
  );

  const acknowledgeAnnouncement = useCallback(
    async (id: number) => {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true, isRead: true } : a))
      );
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/announcements/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ acknowledged: true, isRead: true }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast('Notice acknowledged and added to calendar');
    },
    [fetchWithAuth, showToast]
  );

  const markAllAnnouncementsRead = useCallback(async () => {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
    if (auth.currentUser) {
      try {
        await fetchWithAuth('/api/db/announcements/read-all', { method: 'PATCH' });
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    }
    showToast('All notices marked as read');
  }, [fetchWithAuth, showToast]);

  const addStudyDocument = useCallback(
    async (doc: Omit<StudyDocumentItem, 'id'>): Promise<StudyDocumentItem> => {
      const tempId = Date.now();
      const optimistic: StudyDocumentItem = { ...doc, id: tempId };
      setDocuments((prev) => [optimistic, ...prev]);
      setSelectedDocumentId(tempId);

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth('/api/db/documents', {
            method: 'POST',
            body: JSON.stringify(doc),
          });
          if (saved) {
            setDocuments((prev) => prev.map((d) => (d.id === tempId ? saved : d)));
            setSelectedDocumentId(saved.id);
            return saved;
          }
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      return optimistic;
    },
    [fetchWithAuth, showToast]
  );

  const updateDocumentSummary = useCallback(
    async (id: number, summaryJson: StudyDocSummary) => {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, summaryJson } : d)));
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/documents/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ summaryJson }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    },
    [fetchWithAuth, showToast]
  );

  const toggleDocChecklistItem = useCallback(
    async (docId: number, checkId: string) => {
      const doc = documents.find((d) => d.id === docId);
      if (!doc) return;
      const updatedSummary: StudyDocSummary = {
        ...doc.summaryJson,
        checklist: doc.summaryJson.checklist.map((item) =>
          item.id === checkId ? { ...item, checked: !item.checked } : item
        ),
      };
      await updateDocumentSummary(docId, updatedSummary);
    },
    [documents, updateDocumentSummary]
  );

  const deleteStudyDocument = useCallback(
    async (id: number) => {
      setDocuments((prev) => {
        const remaining = prev.filter((d) => d.id !== id);
        if (selectedDocumentId === id && remaining.length > 0) {
          setSelectedDocumentId(remaining[0].id);
        }
        return remaining;
      });
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/documents/${id}`, { method: 'DELETE' });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast('Document removed');
    },
    [fetchWithAuth, selectedDocumentId, showToast]
  );

  const createChatSession = useCallback(
    async (title: string, scope: string[], deepReasoning: boolean): Promise<ChatSessionItem> => {
      const tempId = Date.now();
      const optimistic: ChatSessionItem = {
        id: tempId,
        title,
        courseScopeJson: scope,
        deepReasoning,
        dateLabel: 'Today',
        messages: [],
      };
      setChatSessions((prev) => [optimistic, ...prev]);
      setActiveSessionId(tempId);

      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth('/api/db/chat/sessions', {
            method: 'POST',
            body: JSON.stringify({ title, courseScopeJson: scope, deepReasoning }),
          });
          if (saved) {
            setChatSessions((prev) => prev.map((s) => (s.id === tempId ? saved : s)));
            setActiveSessionId(saved.id);
            return saved;
          }
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      return optimistic;
    },
    [fetchWithAuth, showToast]
  );

  const deleteChatSession = useCallback(
    async (id: number) => {
      setChatSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (activeSessionId === id && remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        }
        return remaining;
      });
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/chat/sessions/${id}`, { method: 'DELETE' });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast('Chat session deleted');
    },
    [activeSessionId, fetchWithAuth, showToast]
  );

  const appendChatMessage = useCallback(
    async (sessionId: number, msg: Omit<ChatMessageItem, 'id' | 'sessionId'>) => {
      const tempMsgId = Date.now() + Math.floor(Math.random() * 1000);
      const optimistic: ChatMessageItem = { ...msg, id: tempMsgId, sessionId };
      setChatSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, messages: [...s.messages, optimistic] } : s))
      );

      if (auth.currentUser) {
        try {
          await fetchWithAuth('/api/db/chat/messages', {
            method: 'POST',
            body: JSON.stringify({ sessionId, ...msg }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    },
    [fetchWithAuth, showToast]
  );

  const clearCurrentSessionMessages = useCallback(
    async (sessionId: number) => {
      setChatSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, messages: [] } : s)));
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/chat/sessions/${sessionId}/messages`, {
            method: 'DELETE',
          });
        } catch (err: any) {
          showToast(err.message || 'Failed clearing session messages', 'error');
        }
      }
      showToast('Session thread cleared');
    },
    [fetchWithAuth, showToast]
  );

  const logStudyHours = useCallback(
    async (hoursToAdd: number) => {
      const tenthsAdd = Math.round(hoursToAdd * 10);
      const nextTenths = studyGoal.loggedTenths + tenthsAdd;
      const nextDaily = [...studyGoal.dailyHoursJson];
      nextDaily[3] = Number((nextDaily[3] + hoursToAdd).toFixed(1));
      setStudyGoal((prev) => ({
        ...prev,
        loggedTenths: nextTenths,
        dailyHoursJson: nextDaily,
      }));

      if (auth.currentUser) {
        try {
          await fetchWithAuth('/api/db/study-goal', {
            method: 'PATCH',
            body: JSON.stringify({ loggedTenths: nextTenths, dailyHoursJson: nextDaily }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast(`Logged +${hoursToAdd}h toward weekly study goal`);
    },
    [fetchWithAuth, showToast, studyGoal]
  );

  const resolveWaiver = useCallback(
    async (id: number, status: 'approved' | 'rejected') => {
      setWaivers((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/waivers/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast(status === 'approved' ? 'Approved +48h extension waiver' : 'Waiver request rejected');
    },
    [fetchWithAuth, showToast]
  );

  const replyDiscussion = useCallback(
    async (id: number, replyText: string, resolved: boolean) => {
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, replyText, resolved, repliesCount: d.repliesCount + (replyText ? 1 : 0) }
            : d
        )
      );
      if (auth.currentUser) {
        try {
          await fetchWithAuth(`/api/db/discussions/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ replyText, resolved }),
          });
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
      showToast(resolved ? 'Thread marked resolved' : 'Reply posted to discussion queue');
    },
    [fetchWithAuth, showToast]
  );

  const updateAcademicAttendance = useCallback(
    async (id: number, classesAttended: number, totalClasses: number) => {
      setAcademicRecords((prev) =>
        prev.map((rec) =>
          rec.id === id ? { ...rec, classesAttended, totalClasses } : rec
        )
      );
      if (auth.currentUser) {
        try {
          const saved = await fetchWithAuth(`/api/db/academics/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ classesAttended, totalClasses }),
          });
          if (saved) {
            setAcademicRecords((prev) => prev.map((r) => (r.id === id ? saved : r)));
          }
        } catch (err: any) {
          showToast(err.message || 'Failed updating attendance', 'error');
        }
      }
      showToast('Attendance record updated');
    },
    [fetchWithAuth, showToast]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        authLoading,
        dbSynced,
        syncing,
        signInWithGoogle,
        logout,
        refreshWorkspace: loadWorkspaceFromDb,
        activeNav,
        setActiveNav,
        globalSearch,
        setGlobalSearch,
        selectedAssignmentId,
        setSelectedAssignmentId,
        selectedAnnouncementId,
        setSelectedAnnouncementId,
        selectedDocumentId,
        setSelectedDocumentId,
        activeSessionId,
        setActiveSessionId,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedResponseId,
        setSelectedResponseId,
        courses,
        assignments,
        announcements,
        documents,
        chatSessions,
        studyGoal,
        waivers,
        discussions,
        facultySchedule,
        customers,
        customerResponses,
        academicRecords,
        toastMessage,
        toastType,
        showToast,
        updateAcademicAttendance,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createCustomerResponse,
        updateCustomerResponse,
        deleteCustomerResponse,
        createAssignment,
        toggleAssignmentComplete,
        toggleRubricCriterion,
        submitAssignmentFile,
        createAnnouncement,
        toggleAnnouncementStar,
        markAnnouncementRead,
        acknowledgeAnnouncement,
        markAllAnnouncementsRead,
        addStudyDocument,
        updateDocumentSummary,
        toggleDocChecklistItem,
        deleteStudyDocument,
        createChatSession,
        deleteChatSession,
        appendChatMessage,
        clearCurrentSessionMessages,
        logStudyHours,
        resolveWaiver,
        replyDiscussion,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider');
  return ctx;
}
