import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Bot,
  CalendarCheck,
  Check,
  Compass,
  Copy,
  Download,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { auth } from '../lib/firebase.ts';
import { useWorkspace, type NavTab } from '../context/WorkspaceContext.tsx';
import { MarkdownMessage } from './MarkdownMessage.tsx';

const QUICK_SUGGESTIONS: Array<{ label: string; prompt: string }> = [
  {
    label: 'Check my attendance',
    prompt:
      'Check my attendance across all my courses, highlight any shortages below 75%, and calculate how many classes I need to attend to reach the target.',
  },
  {
    label: 'Analyze my performance',
    prompt:
      'Analyze my academic performance across subjects, identify where I need improvement, and suggest practical study strategies.',
  },
  {
    label: 'Create a study plan',
    prompt:
      'Create a personalized daily and weekly study schedule prioritizing my pending/overdue assignments and weaker subjects.',
  },
  {
    label: 'Explain my CGPA',
    prompt:
      'Explain my current CGPA based on my course credits, marks, and grades, and show which subjects impact it most.',
  },
  {
    label: 'Help me navigate the dashboard',
    prompt:
      'Help me navigate EduTrack AI and show me where to find attendance, marks, timetable, assignments, and study materials.',
  },
];

export function ChatbotView() {
  const {
    user,
    courses,
    assignments,
    academicRecords,
    studyGoal,
    facultySchedule,
    chatSessions,
    activeSessionId,
    setActiveSessionId,
    setActiveNav,
    createChatSession,
    deleteChatSession,
    appendChatMessage,
    clearCurrentSessionMessages,
    showToast,
  } = useWorkspace();

  const activeSession =
    chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0] || null;

  const [courseScope, setCourseScope] = useState<string[]>(
    activeSession?.courseScopeJson || ['CS301', 'MATH240', 'BIO110', 'ENG205']
  );
  const [deepReasoning, setDeepReasoning] = useState<boolean>(
    activeSession?.deepReasoning ?? false
  );
  const [promptInput, setPromptInput] = useState('');
  const [sending, setSending] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ message: string; lastPrompt: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const studentName = user?.displayName || 'Alex Vance';

  const academicSnapshotStats = useMemo(() => {
    const totalCredits = academicRecords.reduce((sum, r) => sum + r.credits, 0);
    const weightedPoints = academicRecords.reduce(
      (sum, r) => sum + r.credits * (r.gradePointsTenths / 10),
      0
    );
    const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '—';
    const shortages = academicRecords.filter(
      (r) => (r.classesAttended / Math.max(1, r.totalClasses)) * 100 < r.targetAttendancePct
    );
    const pendingTasks = assignments.filter((a) => a.status !== 'completed').length;
    return { cgpa, shortages, pendingTasks };
  }, [academicRecords, assignments]);

  useEffect(() => {
    if (activeSession) {
      setCourseScope(activeSession.courseScopeJson || ['CS301', 'MATH240', 'BIO110', 'ENG205']);
      setDeepReasoning(activeSession.deepReasoning ?? false);
    }
  }, [activeSession?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeSession?.messages.length, sending]);

  const toggleCourseScope = (code: string) => {
    setCourseScope((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const ensureActiveSession = async () => {
    if (activeSession) return activeSession;
    return createChatSession('EduTrack Academic Advising', courseScope, deepReasoning);
  };

  const handleSend = async (textOverride?: string, skipUserAppend = false) => {
    const raw = textOverride ?? promptInput;
    const content = raw.trim();

    if (!content) {
      setInputError('Please enter a message before sending.');
      return;
    }
    if (sending) return;

    setInputError(null);
    setApiError(null);
    if (!textOverride) setPromptInput('');

    const session = await ensureActiveSession();
    const priorHistory = session.messages;

    if (!skipUserAppend) {
      const timeLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      await appendChatMessage(session.id, {
        role: 'user',
        badgeLabel: 'Student',
        timeLabel,
        content,
      });
    }

    try {
      setSending(true);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch {
          // continue cleanly
        }
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          history: priorHistory,
          courseScope,
          deepReasoning,
          studentContext: {
            studentName,
            academicRecords,
            assignments,
            studyGoal,
            facultySchedule,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `EduTrack AI service returned status ${res.status}`);
      }

      await appendChatMessage(session.id, {
        role: 'assistant',
        badgeLabel: deepReasoning ? 'Deep Academic Analysis' : 'EduTrack AI Assistant',
        timeLabel: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        content: data.content,
        codeSnippet: data.codeSnippet,
        gotchaTip: data.gotchaTip,
        navActionsJson: Array.isArray(data.navActions) ? data.navActions : [],
      });
    } catch (err: any) {
      const msg =
        err?.name === 'TypeError'
          ? 'Network connection issue while contacting EduTrack AI Assistant. Please check your connection and retry.'
          : err?.message || 'EduTrack AI Assistant is temporarily unavailable.';
      setApiError({ message: msg, lastPrompt: content });
      showToast(msg, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleExportTranscript = () => {
    if (!activeSession) return;
    const text = activeSession.messages
      .map((m) => `[${m.timeLabel}] ${m.role.toUpperCase()}:\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `edutrack_assistant_session_${activeSession.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported conversation transcript');
  };

  return (
    <div className="space-y-5">
      {/* Assistant Header */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#5B67E8] to-[#414CCE] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#141936]">EduTrack AI Assistant</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[11px] font-bold">
                Personalized for {studentName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#454654] mt-1">
              <span className="inline-flex items-center gap-1 font-semibold text-[#141936]">
                <Award className="w-3.5 h-3.5 text-[#414CCE]" />
                CGPA: <span className="tabular-nums">{academicSnapshotStats.cgpa} / 4.00</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                {academicSnapshotStats.shortages.length > 0
                  ? `${academicSnapshotStats.shortages.length} Attendance Alert (${academicSnapshotStats.shortages
                      .map((s) => s.courseCode)
                      .join(', ')})`
                  : 'All courses meeting attendance target'}
              </span>
              <span>•</span>
              <span className="tabular-nums">
                {academicSnapshotStats.pendingTasks} active tasks
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => activeSession && clearCurrentSessionMessages(activeSession.id)}
            disabled={!activeSession || activeSession.messages.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8FC] text-xs font-semibold text-[#454654] hover:text-[#141936] disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
          <button
            onClick={handleExportTranscript}
            disabled={!activeSession || activeSession.messages.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC] disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={() => setDeepReasoning((d) => !d)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              deepReasoning
                ? 'bg-[#414CCE] text-white'
                : 'bg-[#EEF3FF] text-[#414CCE]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Deep Analysis
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Sessions, Subject Scope, Quick Navigation */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="card-elevated rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
                CHAT SESSIONS
              </span>
              <button
                onClick={() =>
                  createChatSession('New Study Advising Chat', courseScope, deepReasoning)
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-[#414CCE] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                New Chat
              </button>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {chatSessions.map((s) => (
                <div
                  key={s.id}
                  className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors ${
                    s.id === activeSession?.id
                      ? 'bg-[#EEF3FF] text-[#414CCE] font-bold'
                      : 'text-[#454654] hover:bg-[#F7F8FC]'
                  }`}
                >
                  <button
                    onClick={() => setActiveSessionId(s.id)}
                    className="flex-1 min-w-0 text-left flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-[#81879C]">{s.dateLabel}</span>
                    {chatSessions.length > 1 && (
                      <button
                        onClick={() => deleteChatSession(s.id)}
                        className="p-1 rounded-md text-[#81879C] hover:text-[#BA1A1A] hover:bg-white"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Focus Scope */}
          <div className="card-elevated rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141936]">Subject Focus</span>
              <span className="px-2 py-0.5 rounded bg-[#EEF3FF] text-[#414CCE] text-[10px] font-bold">
                {courseScope.length} ACTIVE
              </span>
            </div>
            <div className="space-y-2">
              {courses.slice(0, 4).map((c) => {
                const checked = courseScope.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => toggleCourseScope(c.code)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                      checked
                        ? 'bg-[#EEF3FF]/60 border-indigo-200'
                        : 'bg-[#F7F8FC] border-slate-200/70'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#141936]">{c.code}</div>
                      <div className="text-[11px] text-[#81879C] truncate">{c.name}</div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        checked ? 'bg-[#414CCE] text-white' : 'bg-white border border-slate-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick App Shortcuts */}
          <div className="card-elevated rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#141936]">
              <Compass className="w-3.5 h-3.5 text-[#414CCE]" />
              Quick Navigation
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { label: 'Dashboard', nav: 'dashboard' },
                  { label: 'Attendance & CGPA', nav: 'analytics' },
                  { label: 'Assignments', nav: 'assignments' },
                  { label: 'Study Hub', nav: 'study-hub' },
                ] as Array<{ label: string; nav: NavTab }>
              ).map((item) => (
                <button
                  key={item.nav}
                  onClick={() => setActiveNav(item.nav)}
                  className="px-2.5 py-2 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-[11px] font-semibold text-[#141936] text-left truncate"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
          {/* Quick Suggestion Chips */}
          <div className="card-elevated rounded-2xl p-3.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#81879C] uppercase tracking-wider px-1">
              Ask Assistant:
            </span>
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSend(s.prompt)}
                disabled={sending}
                className="px-3 py-1.5 rounded-xl bg-[#EEF3FF] hover:bg-[#414CCE] text-[#414CCE] hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="card-elevated rounded-2xl p-5 sm:p-6 space-y-5 min-h-[470px] max-h-[600px] overflow-y-auto">
            {/* Attractive Welcome Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#EEF3FF] to-[#F2EEFF] border border-indigo-200/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#414CCE] flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-[#141936]">
                    Hi {studentName.split(' ')[0]}! Welcome to EduTrack AI Assistant
                  </div>
                  <p className="text-xs text-[#454654] leading-relaxed">
                    I&apos;m connected to your live attendance, marks, CGPA, timetable, and
                    assignments. Ask me to explain tough topics, calculate classes needed for your
                    attendance target, build a study schedule, or open any dashboard module.
                  </p>
                </div>
              </div>
            </div>

            {(!activeSession || activeSession.messages.length === 0) && !sending && (
              <div className="py-10 text-center space-y-2">
                <Sparkles className="w-7 h-7 text-[#414CCE] mx-auto" />
                <div className="text-sm font-bold text-[#141936]">Ready to Help You Succeed</div>
                <p className="text-xs text-[#81879C] max-w-md mx-auto">
                  Click one of the quick suggestions above or type your academic question below.
                </p>
              </div>
            )}

            {activeSession?.messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="flex flex-col items-end max-w-[85%] sm:max-w-2xl">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#81879C] mb-1">
                        <span>{msg.timeLabel}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#141936]">{studentName}</span>
                        <User className="w-3 h-3 text-[#414CCE]" />
                      </div>
                      <div className="rounded-2xl rounded-tr-sm bg-[#414CCE] text-white px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-2.5 min-w-0 max-w-[92%]">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-[#141936]">EduTrack AI Assistant</span>
                      {msg.badgeLabel && (
                        <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[10px] font-semibold">
                          {msg.badgeLabel}
                        </span>
                      )}
                      <span className="text-[#81879C]">{msg.timeLabel}</span>
                    </div>

                    <div className="rounded-2xl rounded-tl-sm bg-[#F7F8FC] border border-slate-200/80 p-4 space-y-3 text-sm text-[#141936] leading-relaxed">
                      <MarkdownMessage content={msg.content} />

                      {msg.codeSnippet && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#141936] text-slate-100">
                          <div className="px-4 py-2 bg-[#1E2448] flex items-center justify-between text-xs">
                            <span className="font-mono text-indigo-200">Code Snippet</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(msg.codeSnippet || '');
                                showToast('Copied code snippet');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                            <code>{msg.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {msg.gotchaTip && (
                        <div className="p-3 rounded-xl bg-[#EEF3FF] border border-indigo-200 flex items-start gap-2.5 text-xs text-[#141936]">
                          <Lightbulb className="w-4 h-4 text-[#414CCE] shrink-0 mt-0.5" />
                          <span>{msg.gotchaTip}</span>
                        </div>
                      )}

                      {/* Clickable Navigation Action Chips */}
                      {msg.navActionsJson && msg.navActionsJson.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-[#81879C] mr-1">
                            Jump to:
                          </span>
                          {msg.navActionsJson.map((action, idx) => (
                            <button
                              key={`${action.nav}-${idx}`}
                              onClick={() => setActiveNav(action.nav as NavTab)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-[#414CCE] hover:bg-[#414CCE] hover:text-white transition-colors"
                            >
                              <span>{action.label}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {sending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-[#EEF3FF]/80 border border-indigo-200 px-4 py-3 inline-flex items-center gap-2 text-xs font-semibold text-[#414CCE]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#414CCE] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#414CCE] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#414CCE] animate-bounce" />
                  </span>
                  <span>EduTrack AI Assistant is typing...</span>
                </div>
              </div>
            )}

            {/* Graceful Service Unavailable / Network Fallback Notice */}
            {apiError && (
              <div className="rounded-2xl bg-[#FFF5F5] border border-red-200 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#BA1A1A]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">AI Assistant Temporarily Unavailable</div>
                      <div className="mt-0.5">{apiError.message}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSend(apiError.lastPrompt, true)}
                    disabled={sending}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#BA1A1A] text-white text-xs font-bold hover:bg-red-700 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>

                {/* Live Local Database Summary Fallback */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-[#454654] space-y-2">
                  <div className="font-bold text-[#141936]">
                    Live Local Summary (While AI Reconnects):
                  </div>
                  <div>
                    CGPA: <strong className="text-[#141936]">{academicSnapshotStats.cgpa}</strong>{' '}
                    • Pending Tasks:{' '}
                    <strong className="text-[#141936]">{academicSnapshotStats.pendingTasks}</strong>{' '}
                    • Attendance Alerts:{' '}
                    <strong className="text-[#BA1A1A]">
                      {academicSnapshotStats.shortages.length > 0
                        ? academicSnapshotStats.shortages.map((s) => s.courseCode).join(', ')
                        : 'None'}
                    </strong>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => setActiveNav('analytics')}
                      className="px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] font-semibold"
                    >
                      Open Attendance &amp; CGPA
                    </button>
                    <button
                      onClick={() => setActiveNav('assignments')}
                      className="px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] font-semibold"
                    >
                      Open Assignments
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="card-elevated rounded-2xl p-4 space-y-2.5">
            {inputError && (
              <div className="px-3 py-2 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2.5"
            >
              <textarea
                rows={2}
                value={promptInput}
                onChange={(e) => {
                  setPromptInput(e.target.value);
                  if (inputError && e.target.value.trim()) setInputError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask EduTrack AI Assistant about attendance, marks, CGPA, study plans, or course topics... (Enter to send)"
                className="flex-1 p-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="h-11 px-5 rounded-xl bg-[#414CCE] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#3540B8] disabled:opacity-50 shrink-0"
              >
                {sending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#81879C]">
              <span>
                Connected to live PostgreSQL student records • Press Enter to send, Shift+Enter for
                new line
              </span>
              <span>Gemini API secured server-side</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
