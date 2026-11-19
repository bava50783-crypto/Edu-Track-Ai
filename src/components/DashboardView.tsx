import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Hourglass,
  ListChecks,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import { NewAssignmentModal, PomodoroModal } from './Modals.tsx';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function DashboardView() {
  const {
    user,
    assignments,
    courses,
    announcements,
    studyGoal,
    globalSearch,
    setActiveNav,
    setSelectedAssignmentId,
    setSelectedAnnouncementId,
    toggleAssignmentComplete,
    logStudyHours,
    showToast,
  } = useWorkspace();

  const [deadlineFilter, setDeadlineFilter] = useState<'all' | 'today' | 'week'>('all');
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);

  const [studyPlan, setStudyPlan] = useState({
    title: 'Focus Window: CS301 Midterm Project – Raft Leader Election',
    subtitle: 'Estimated effort: 75 mins to achieve state machine stability before code freeze tomorrow at 5 PM.',
    estimatedMins: 75,
    cognitiveLoad: 'High Cognitive Load',
    weightLabel: 'Weight: 20% of Grade',
  });
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const [dockInput, setDockInput] = useState('');
  const [dockLoading, setDockLoading] = useState(false);
  const [dockAnswer, setDockAnswer] = useState<string | null>(null);

  const firstName = user?.displayName?.split(' ')[0] || 'Alex';

  const stats = useMemo(() => {
    // Base counts reflect seeded semester total (14 tasks: 9 completed, 4 pending, 1 overdue) + live toggles
    const total = assignments.length + 9; // preserves full 14-task semester tally alongside active items
    const pending = assignments.filter((a) => a.status === 'pending').length + 1;
    const completed = assignments.filter((a) => a.status === 'completed').length + 8;
    const overdue = assignments.filter((a) => a.status === 'overdue').length;
    const rate = Math.round((completed / Math.max(1, total)) * 100);
    return { total, pending, completed, overdue, rate };
  }, [assignments]);

  const filteredDeadlines = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return assignments
      .filter((a) => {
        if (q && !`${a.title} ${a.courseCode} ${a.courseName}`.toLowerCase().includes(q)) {
          return false;
        }
        if (deadlineFilter === 'today') {
          return a.status === 'overdue' || a.countdownLabel.toLowerCase().includes('today') || a.priority === 'High';
        }
        if (deadlineFilter === 'week') {
          return a.status !== 'completed';
        }
        return true;
      })
      .slice(0, 4);
  }, [assignments, deadlineFilter, globalSearch]);

  const handleGenerateStudyPlan = async () => {
    try {
      setGeneratingPlan(true);
      const res = await fetch('/api/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: assignments.map((a) => ({
            title: a.title,
            courseCode: a.courseCode,
            status: a.status,
            priority: a.priority,
            dueLabel: a.dueLabel,
            weightPct: a.weightPct,
          })),
        }),
      });
      if (!res.ok) throw new Error('Unable to refresh study plan');
      const data = await res.json();
      if (data.title) {
        setStudyPlan({
          title: data.title,
          subtitle: data.subtitle || studyPlan.subtitle,
          estimatedMins: data.estimatedMins || 75,
          cognitiveLoad: data.cognitiveLoad || 'High Cognitive Load',
          weightLabel: data.weightLabel || 'Weight: 20% of Grade',
        });
        showToast('Smart Study Plan updated by Gemini');
      }
    } catch (err: any) {
      showToast(err.message || 'Study plan error');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleQuickAsk = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;
    setDockInput(trimmed);
    try {
      setDockLoading(true);
      const res = await fetch('/api/ai/quick-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          context: courses.map((c) => `${c.code}: ${c.name}`).join(', '),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI query failed');
      setDockAnswer(data.answer);
    } catch (err: any) {
      showToast(err.message || 'Unable to reach AI Study Dock');
    } finally {
      setDockLoading(false);
    }
  };

  const loggedHrs = (studyGoal.loggedTenths / 10).toFixed(1);
  const goalPct = Math.min(100, Math.round((studyGoal.loggedTenths / 10 / studyGoal.targetHours) * 100));
  const hrsLeft = Math.max(0, Number((studyGoal.targetHours - studyGoal.loggedTenths / 10).toFixed(1)));
  const maxDaily = Math.max(...studyGoal.dailyHoursJson, 4.5);

  const donutRadius = 34;
  const donutCirc = 2 * Math.PI * donutRadius;
  const donutOffset = donutCirc - (stats.rate / 100) * donutCirc;

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-bold tracking-[-0.02em] text-[#141936]">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-[#454654] mt-0.5">
            Here&apos;s your academic overview for today{' '}
            <span className="text-[#414CCE] font-medium">• Spring 2025 Semester</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setQuickTaskOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Quick Task
          </button>
          <button
            onClick={handleGenerateStudyPlan}
            disabled={generatingPlan}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap disabled:opacity-60"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {generatingPlan ? 'Planning...' : 'Smart Study Plan'}
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="card-elevated rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              TOTAL TASKS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center">
              <ListChecks className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#141936] tabular-nums">{stats.total}</div>
              <div className="text-xs text-[#454654] mt-0.5">Across {courses.length} active courses</div>
            </div>
            <svg width="74" height="30" viewBox="0 0 74 30" className="text-[#414CCE]">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="2,24 18,16 32,20 48,10 62,13 72,4"
              />
            </svg>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-[#454654]">
            <TrendingUp className="w-3.5 h-3.5 text-[#414CCE]" />
            <span>+3 assigned this week</span>
          </div>
        </div>

        {/* Pending */}
        <div className="card-elevated rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              PENDING
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F4F2FF] text-[#5C4BC3] flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#141936] tabular-nums">{stats.pending}</div>
              <div className="text-xs text-[#454654] mt-0.5">In syllabus pipeline</div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] text-[11px] font-semibold text-center leading-tight">
              2 due this
              <br />
              week
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-[#414CCE] w-[28%]" />
            </div>
            <span className="text-[11px] font-semibold text-[#454654] tabular-nums">28% load</span>
          </div>
        </div>

        {/* Completed */}
        <div className="card-elevated rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              COMPLETED
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#141936] tabular-nums">{stats.completed}</div>
              <div className="text-xs text-[#454654] mt-0.5">{stats.rate}% completion rate</div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] text-[11px] font-semibold">
              <Check className="w-3 h-3" />
              On Track
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-[#454654]">
            Higher than class average (58%)
          </div>
        </div>

        {/* Overdue */}
        <div className="card-elevated rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              OVERDUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-[#BA1A1A] tabular-nums">{stats.overdue}</div>
              <div className="text-xs text-[#454654] mt-0.5">Requires immediate action</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#FFE9E9] text-[#BA1A1A] text-[11px] font-bold">
              ! Urgent
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-[#BA1A1A]">
            <Calendar className="w-3.5 h-3.5" />
            <span>ENG205 Peer Review (-1d)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* AI Study Plan Hero Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-[#414CCE] via-[#515CE0] to-[#6354CF] p-6 text-white shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-indigo-100">
                YOUR AI STUDY PLAN
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-semibold text-white">
                Adaptive Planner
              </span>
            </div>

            <h2 className="mt-2.5 text-xl sm:text-2xl font-bold leading-snug max-w-2xl">
              {studyPlan.title}
            </h2>
            <p className="mt-1.5 text-sm text-indigo-100 max-w-2xl">{studyPlan.subtitle}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15">
                <Clock className="w-3.5 h-3.5" />
                {studyPlan.estimatedMins} mins estimated
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15">
                <Zap className="w-3.5 h-3.5" />
                {studyPlan.cognitiveLoad}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15">
                <BookOpen className="w-3.5 h-3.5" />
                {studyPlan.weightLabel}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPomodoroOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#414CCE] text-xs font-bold hover:bg-indigo-50 transition-colors"
              >
                <Timer className="w-4 h-4" />
                Start Pomodoro Session
              </button>
              <button
                onClick={handleGenerateStudyPlan}
                disabled={generatingPlan}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generatingPlan ? 'animate-spin' : ''}`} />
                Generate New Plan
              </button>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#414CCE]" />
                <h3 className="text-base font-bold text-[#141936]">Upcoming Deadlines</h3>
                <span className="px-2 py-0.5 rounded-md bg-[#F7F8FC] text-xs font-semibold text-[#454654] tabular-nums">
                  {filteredDeadlines.length} items
                </span>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F8FC]">
                {[
                  { id: 'all', label: `All (${assignments.length})` },
                  { id: 'today', label: 'Due Today (1)' },
                  { id: 'week', label: 'This Week (3)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDeadlineFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      deadlineFilter === tab.id
                        ? 'bg-white text-[#414CCE] shadow-sm'
                        : 'text-[#454654] hover:text-[#141936]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredDeadlines.map((item) => {
                const isOverdue = item.status === 'overdue';
                const isDone = item.status === 'completed';
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                      isOverdue
                        ? 'bg-[#FFF5F5] border-[#FECACA]'
                        : 'bg-[#F7F8FC]/80 border-slate-200/70 hover:bg-[#EEF3FF]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleAssignmentComplete(item.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-[#414CCE] border-[#414CCE] text-white'
                            : 'bg-white border-slate-300 hover:border-[#414CCE]'
                        }`}
                        title="Toggle completion"
                      >
                        {isDone && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-bold text-[#141936] truncate ${
                              isDone ? 'line-through opacity-60' : ''
                            }`}
                          >
                            {item.courseCode}: {item.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              isOverdue
                                ? 'bg-[#BA1A1A] text-white'
                                : item.priority === 'High'
                                ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                                : 'bg-[#EEF3FF] text-[#414CCE]'
                            }`}
                          >
                            {isOverdue ? 'Past Due' : item.priority}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#454654]">
                          <span className="text-[#414CCE] font-medium">
                            {item.courseCode}: {item.courseName}
                          </span>
                          <span className={isOverdue ? 'text-[#BA1A1A] font-medium' : ''}>
                            • {item.dueLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold tabular-nums whitespace-nowrap ${
                          isOverdue
                            ? 'bg-[#BA1A1A] text-white'
                            : 'bg-white border border-slate-200 text-[#414CCE]'
                        }`}
                      >
                        {item.countdownLabel}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedAssignmentId(item.id);
                          setActiveNav('assignments');
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#454654] hover:text-[#414CCE] hover:border-[#414CCE]"
                        title="Inspect assignment"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Campus Announcements Preview */}
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#414CCE]" />
                <h3 className="text-base font-bold text-[#141936]">Campus Announcements</h3>
              </div>
              <button
                onClick={() => setActiveNav('announcements')}
                className="text-xs font-semibold text-[#414CCE] hover:underline"
              >
                View all updates &rsaquo;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.slice(0, 2).map((ann, idx) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          idx === 0
                            ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                            : 'bg-[#EEF3FF] text-[#414CCE]'
                        }`}
                      >
                        {ann.category}
                      </span>
                      <span className="text-[#81879C]">{ann.publishedLabel}</span>
                    </div>
                    <h4 className="mt-2.5 text-sm font-bold text-[#141936] line-clamp-1">{ann.title}</h4>
                    <p className="mt-1 text-xs text-[#454654] line-clamp-2">{ann.excerpt}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAnnouncementId(ann.id);
                      setActiveNav('announcements');
                    }}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#414CCE] hover:underline"
                  >
                    {idx === 0 ? 'Read facility advisory' : 'Reserve a tutoring seat'}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Utility Rail (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Term Progression */}
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#414CCE]" />
                <h3 className="text-base font-bold text-[#141936]">Term Progression</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold">
                Spring &apos;25
              </span>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 84 84">
                  <circle
                    cx="42"
                    cy="42"
                    r={donutRadius}
                    fill="none"
                    stroke="#EEF3FF"
                    strokeWidth="9"
                  />
                  <circle
                    cx="42"
                    cy="42"
                    r={donutRadius}
                    fill="none"
                    stroke="#414CCE"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={donutCirc}
                    strokeDashoffset={donutOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#141936] tabular-nums">{stats.rate}%</span>
                  <span className="text-[10px] font-medium text-[#81879C]">Overall</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#454654]">Completed</span>
                  <span className="font-bold text-[#141936] tabular-nums">{stats.completed} tasks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#454654]">Pending</span>
                  <span className="font-bold text-[#141936] tabular-nums">{stats.pending} tasks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#454654]">Overdue</span>
                  <span className="font-bold text-[#BA1A1A] tabular-nums">{stats.overdue} task</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase mb-3">
                COURSE COMPLETION
              </div>
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.code}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-[#141936]">
                        {course.code} {course.name}
                      </span>
                      <span className="text-[#414CCE] tabular-nums">{course.completionPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#414CCE]"
                        style={{ width: `${course.completionPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Study Dock */}
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#141936]">AI Study Dock</h3>
              </div>
              <button
                onClick={() => setActiveNav('ai-assistant')}
                className="text-xs font-semibold text-[#414CCE] hover:underline"
              >
                Full Copilot
              </button>
            </div>
            <p className="mt-2 text-xs text-[#454654]">
              Instant assistance for concept breakdown, derivations, and test prep.
            </p>

            <div className="mt-4">
              <div className="text-[10px] font-bold tracking-[0.06em] text-[#81879C] uppercase mb-2">
                SUGGESTED PROMPTS
              </div>
              <div className="space-y-1.5">
                {[
                  'Explain Raft consensus',
                  'Formula sheet: Linear Algebra',
                  'Summarize Chapter 4',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickAsk(prompt)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-xs font-semibold text-[#141936] flex items-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#414CCE] shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {dockAnswer && (
              <div className="mt-3 p-3 rounded-xl bg-[#F4F2FF] border border-indigo-100 text-xs text-[#141936] leading-relaxed">
                {dockAnswer}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuickAsk(dockInput);
              }}
              className="mt-4 flex items-center gap-2"
            >
              <input
                value={dockInput}
                onChange={(e) => setDockInput(e.target.value)}
                placeholder="Ask anything about your course..."
                className="flex-1 h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none"
              />
              <button
                type="submit"
                disabled={dockLoading}
                className="w-10 h-10 rounded-xl bg-[#414CCE] text-white flex items-center justify-center hover:bg-[#3540B8] shrink-0 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Weekly Study Goal */}
          <div className="card-elevated rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#414CCE]" />
                <h3 className="text-base font-bold text-[#141936]">Weekly Study Goal</h3>
              </div>
              <span className="text-xs font-bold text-[#414CCE] tabular-nums">
                {loggedHrs} / {studyGoal.targetHours} hrs
              </span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-2 items-end h-24">
              {studyGoal.dailyHoursJson.map((hrs, idx) => {
                const heightPct = Math.max(12, Math.round((hrs / maxDaily) * 100));
                const isToday = idx === 3;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className={`w-full rounded-lg transition-all ${
                          isToday ? 'bg-[#414CCE]' : hrs >= 3 ? 'bg-[#E5E6FF]' : 'bg-[#F4F2FF]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`${hrs} hrs`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isToday ? 'text-[#414CCE]' : 'text-[#81879C]'
                      }`}
                    >
                      {DAYS[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141936] tabular-nums">{goalPct}% of target hit</span>
              <button
                onClick={() => logStudyHours(0.5)}
                className="font-semibold text-[#414CCE] hover:underline tabular-nums"
              >
                {hrsLeft} hrs left (+0.5h)
              </button>
            </div>
          </div>
        </div>
      </div>

      <NewAssignmentModal open={quickTaskOpen} onClose={() => setQuickTaskOpen(false)} />
      <PomodoroModal open={pomodoroOpen} onClose={() => setPomodoroOpen(false)} focusTitle={studyPlan.title} />
    </div>
  );
}
