import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Eye,
  Hourglass,
  LayoutGrid,
  List,
  Search,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import { NewAssignmentModal, RaftSimulatorModal } from './Modals.tsx';

export function AssignmentsView() {
  const {
    assignments,
    courses,
    selectedAssignmentId,
    setSelectedAssignmentId,
    toggleRubricCriterion,
    submitAssignmentFile,
    toggleAssignmentComplete,
    globalSearch,
    showToast,
  } = useWorkspace();

  const [localSearch, setLocalSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [newOpen, setNewOpen] = useState(false);
  const [raftSimOpen, setRaftSimOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string>('');
  const [aiEdgeAnswer, setAiEdgeAnswer] = useState<string | null>(null);
  const [explainingEdge, setExplainingEdge] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = (localSearch || globalSearch).trim().toLowerCase();
    return assignments.filter((a) => {
      if (courseFilter !== 'ALL' && a.courseCode !== courseFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (q && !`${a.title} ${a.courseCode} ${a.courseName} ${a.instructor}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [assignments, courseFilter, statusFilter, localSearch, globalSearch]);

  const activeAssignment =
    assignments.find((a) => a.id === selectedAssignmentId) || filtered[0] || assignments[0];

  const metCount = activeAssignment?.rubricJson.filter((r) => r.met).length || 0;
  const totalRubric = activeAssignment?.rubricJson.length || 0;

  const handleSyncIcal = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EduTrack AI//Academic OS//EN',
      ...assignments.map(
        (a) =>
          `BEGIN:VEVENT\nSUMMARY:${a.courseCode} - ${a.title}\nDESCRIPTION:${a.subtitle} (${a.priority})\nEND:VEVENT`
      ),
      'END:VCALENDAR',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edutrack_spring2025_deadlines.ics';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported Spring 2025 deadlines to iCal (.ics)');
  };

  const handleExplainEdgeCase = async () => {
    if (!activeAssignment) return;
    try {
      setExplainingEdge(true);
      const res = await fetch('/api/ai/quick-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Explain the critical edge case for "${activeAssignment.title}" (${activeAssignment.courseCode}): ${activeAssignment.aiHint}`,
          context: activeAssignment.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI explanation failed');
      setAiEdgeAnswer(data.answer);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setExplainingEdge(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-[0.08em] text-[#414CCE] uppercase">
            ACADEMIC TRACKER <span className="text-[#81879C] font-medium ml-2">Updated 14 mins ago</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#141936] mt-0.5">
            My Assignments
          </h1>
          <p className="text-sm text-[#454654]">
            Stay organised, monitor deadlines, and track submission progress across all courses.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSyncIcal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC] whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-[#414CCE]" />
            Sync iCal
          </button>
          <button
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white text-xs font-semibold shadow-sm whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            New Submission
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#454654] font-semibold">
            <span>Total Assignments</span>
            <ClipboardList className="w-4 h-4 text-[#414CCE]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">
              {assignments.length + 9}
            </span>
            <span className="text-xs text-[#81879C]">Across {courses.length} Courses</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-[#81879C]">Completion Velocity</span>
            <span className="font-bold text-[#414CCE]">64% Done</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#414CCE] w-[64%] rounded-full" />
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#454654] font-semibold">
            <span>Pending Tasks</span>
            <Hourglass className="w-4 h-4 text-[#5C4BC3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">
              {assignments.filter((a) => a.status === 'pending').length + 1}
            </span>
            <span className="text-xs text-[#414CCE]">Require grading/upload</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-[#81879C]">Active Focus Today</span>
            <span className="font-bold text-[#141936]">2 Imminent</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#5C4BC3] w-[42%] rounded-full" />
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-[#454654] font-semibold">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#414CCE]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">
              {assignments.filter((a) => a.status === 'completed').length + 8}
            </span>
            <span className="text-xs text-[#454654]">Avg score: 94.2%</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-[#81879C]">Target Pace</span>
            <span className="font-bold text-[#414CCE]">+2 Ahead</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#414CCE] w-[78%] rounded-full" />
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#FFF5F5] border border-[#FECACA]">
          <div className="flex items-center justify-between text-xs text-[#BA1A1A] font-semibold">
            <span>Overdue Tasks</span>
            <AlertCircle className="w-4 h-4 text-[#BA1A1A]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#BA1A1A] tabular-nums">
              {assignments.filter((a) => a.status === 'overdue').length}
            </span>
            <span className="text-xs text-[#BA1A1A]">Grace window active</span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#FECACA]/60 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#BA1A1A]">CS301 Consensus</span>
            <span className="font-bold text-[#BA1A1A]">Late -5%</span>
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-rose-200 overflow-hidden">
            <div className="h-full bg-[#BA1A1A] w-[85%] rounded-full" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-elevated rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 text-[#81879C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs font-semibold text-[#141936]"
          >
            <option value="ALL">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F8FC]">
            {[
              { id: 'all', label: `All ${assignments.length}` },
              { id: 'pending', label: `Pending ${assignments.filter((a) => a.status === 'pending').length}` },
              { id: 'completed', label: `Completed ${assignments.filter((a) => a.status === 'completed').length}` },
              { id: 'overdue', label: `Overdue ${assignments.filter((a) => a.status === 'overdue').length}` },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  statusFilter === s.id
                    ? 'bg-white text-[#414CCE] shadow-sm'
                    : 'text-[#454654] hover:text-[#141936]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#F7F8FC] p-1 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#414CCE] shadow-sm' : 'text-[#81879C]'}`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#414CCE] shadow-sm' : 'text-[#81879C]'}`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Table / List + Cadence Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="px-5 py-3 bg-[#F7F8FC] border-b border-slate-200/70 grid grid-cols-12 text-[11px] font-bold text-[#81879C] uppercase tracking-wider">
              <div className="col-span-6">Course &amp; Assignment Title</div>
              <div className="col-span-3">Due Date &amp; Status</div>
              <div className="col-span-3 text-right">Priority / Actions</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const selected = activeAssignment?.id === item.id;
                const isOverdue = item.status === 'overdue';
                const isDone = item.status === 'completed';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedAssignmentId(item.id);
                      setAiEdgeAnswer(null);
                    }}
                    className={`px-5 py-4 grid grid-cols-12 items-center gap-3 cursor-pointer transition-colors ${
                      selected ? 'bg-[#EEF3FF]/70' : 'hover:bg-[#F7F8FC]'
                    }`}
                  >
                    <div className="col-span-12 sm:col-span-6 flex items-start gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isOverdue
                            ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                            : 'bg-[#EEF3FF] text-[#414CCE]'
                        }`}
                      >
                        {item.courseCode.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#414CCE]">
                          {item.courseCode} · {item.courseName}
                        </div>
                        <div className="text-sm font-bold text-[#141936] truncate">{item.title}</div>
                        <div className="text-[11px] text-[#81879C] truncate">
                          {item.instructor} · {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isOverdue
                            ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#EEF3FF] text-[#414CCE]'
                        }`}
                      >
                        {item.countdownLabel}
                      </span>
                      <div className="text-[11px] text-[#454654] mt-1 tabular-nums">{item.dueLabel}</div>
                    </div>

                    <div className="col-span-6 sm:col-span-3 flex items-center justify-end gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          item.priority === 'High' || item.priority === 'Urgent'
                            ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                            : 'bg-[#F7F8FC] text-[#454654]'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignmentId(item.id);
                        }}
                        className="p-1.5 rounded-lg text-[#81879C] hover:text-[#414CCE] hover:bg-white"
                        title="Inspect"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.status === 'overdue') {
                            setSelectedAssignmentId(item.id);
                            fileInputRef.current?.click();
                          } else {
                            toggleAssignmentComplete(item.id);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          isOverdue
                            ? 'bg-[#414CCE] text-white'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#EEF3FF] text-[#414CCE] hover:bg-[#E0E7FF]'
                        }`}
                      >
                        {isOverdue ? 'Upload' : isDone ? 'Done' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Term Submission Cadence Card */}
          <div className="card-elevated rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
                TERM SUBMISSION CADENCE
              </div>
              <div className="mt-1 text-xl font-bold text-[#141936] tabular-nums">
                93.8% On-Time Completion Rate
              </div>
              <p className="mt-1 text-xs text-[#454654] max-w-sm">
                You&apos;re currently trending in the 91st percentile among enrolled computer science and
                mathematics cohorts this semester.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-bold text-[#414CCE] tabular-nums mb-1">12 / 14 Milestones Hit</div>
              <svg width="160" height="48" viewBox="0 0 160 48">
                <defs>
                  <linearGradient id="cadenceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#414CCE" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#414CCE" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 L26,34 L52,36 L78,24 L104,28 L130,14 L160,6 L160,48 L0,48 Z"
                  fill="url(#cadenceFill)"
                />
                <polyline
                  fill="none"
                  stroke="#414CCE"
                  strokeWidth="2.5"
                  points="0,40 26,34 52,36 78,24 104,28 130,14 160,6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Inspector Drawer */}
        {activeAssignment && (
          <div className="lg:col-span-5 space-y-5">
            <div className="card-elevated rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-[#FFE9E9] text-[#BA1A1A] font-semibold">
                      {activeAssignment.status === 'overdue' ? 'Action Required' : activeAssignment.priority}
                    </span>
                    <span className="text-[#81879C] font-medium">Assignment #{activeAssignment.id}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-[#141936] leading-snug">
                    {activeAssignment.title}
                  </h2>
                  <div className="text-xs text-[#454654] mt-0.5">
                    {activeAssignment.courseCode} • {activeAssignment.instructor}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[#81879C]">
                  <button
                    onClick={() => showToast('Assignment bookmarked')}
                    className="p-1.5 rounded-lg hover:bg-[#F7F8FC] hover:text-[#414CCE]"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRaftSimOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-[#F7F8FC] hover:text-[#414CCE]"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {activeAssignment.status === 'overdue' && (
                <div className="p-3.5 rounded-xl bg-[#FFF5F5] border border-[#FECACA] flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <div className="font-bold text-[#BA1A1A]">1 Day Overdue (Grace window closing)</div>
                    <div className="text-[#454654] mt-0.5">Cut-off penalty applies: -5% per 24 hours</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white text-[#BA1A1A] text-xs font-bold tabular-nums shrink-0">
                    {activeAssignment.graceRemaining || '23h 14m left'}
                  </span>
                </div>
              )}

              {/* EduTrack AI Co-Pilot Box */}
              <div className="p-4 rounded-xl bg-[#F4F2FF] border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#414CCE]">
                    <Sparkles className="w-3.5 h-3.5" />
                    EduTrack AI Co-Pilot
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white text-[#414CCE] text-[10px] font-bold">
                    High Confidence
                  </span>
                </div>
                <p className="text-xs text-[#141936] leading-relaxed">
                  &ldquo;{activeAssignment.aiHint}&rdquo;
                </p>

                {aiEdgeAnswer && (
                  <div className="p-3 rounded-lg bg-white text-xs text-[#141936] border border-indigo-100 leading-relaxed">
                    {aiEdgeAnswer}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExplainEdgeCase}
                    disabled={explainingEdge}
                    className="px-3 py-1.5 rounded-lg bg-[#414CCE] text-white text-xs font-semibold hover:bg-[#3540B8] disabled:opacity-60"
                  >
                    {explainingEdge ? 'Analyzing...' : 'Explain Edge Case'}
                  </button>
                  <button
                    onClick={() => setRaftSimOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#141936] text-xs font-semibold border border-slate-200 hover:bg-[#F7F8FC]"
                  >
                    View Raft Simulator
                  </button>
                </div>
              </div>

              {/* Grading Rubric Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[#141936]">Grading Rubric Checklist</span>
                  <span className="text-xs font-semibold text-[#414CCE] tabular-nums">
                    {metCount} of {totalRubric} Criteria Met
                  </span>
                </div>
                <div className="space-y-2">
                  {activeAssignment.rubricJson.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => toggleRubricCriterion(activeAssignment.id, r.id)}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                        r.met
                          ? 'bg-[#EEF3FF]/60 border-indigo-100'
                          : 'bg-[#FFF5F5]/60 border-rose-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            r.met ? 'bg-[#414CCE] text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {r.met && <Check className="w-3 h-3" />}
                        </span>
                        <span className="text-xs font-medium text-[#141936] truncate">{r.label}</span>
                      </div>
                      <span
                        className={`text-xs font-bold tabular-nums shrink-0 ${
                          r.met ? 'text-[#141936]' : 'text-[#BA1A1A]'
                        }`}
                      >
                        {r.met ? `${r.earned}/${r.points}` : 'Pending'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Submission */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#141936]">Upload Submission</span>
                  <span className="text-[#81879C]">ZIP, TAR.GZ, or PDF up to 50MB</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setPendingFileName(file.name);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-[#F7F8FC] hover:border-[#414CCE] text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-[#414CCE] mx-auto" />
                  <p className="mt-2 text-xs text-[#141936] font-medium">
                    {pendingFileName || activeAssignment.submittedFileName ? (
                      <span className="text-[#414CCE] font-bold">
                        Selected: {pendingFileName || activeAssignment.submittedFileName}
                      </span>
                    ) : (
                      <>
                        Drag &amp; drop your archive here, or{' '}
                        <span className="text-[#414CCE] underline">browse files</span>
                      </>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#81879C]">
                    Supports raft_consensus.tar.gz or test_runner.py
                  </p>
                </div>

                <button
                  onClick={() =>
                    submitAssignmentFile(
                      activeAssignment.id,
                      pendingFileName || `${activeAssignment.courseCode.toLowerCase()}_submission.tar.gz`
                    )
                  }
                  className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Finalize &amp; Submit Assignment
                </button>
              </div>
            </div>

            {/* Instructor Office Hours Card */}
            <div className="card-elevated rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/src/assets/images/avatar_aris_thorne_1795064440903.jpg"
                  alt="Dr. Aris Thorne"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#141936] truncate">
                    {activeAssignment.instructor}&apos;s Office Hours
                  </div>
                  <div className="text-[11px] text-[#454654] truncate">
                    Today: 3:00 PM – 4:30 PM (Turing Hall 402)
                  </div>
                </div>
              </div>
              <button
                onClick={() => showToast(`Booked 1-on-1 slot with ${activeAssignment.instructor}`)}
                className="px-3 py-1.5 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF] shrink-0"
              >
                Book 1-on-1
              </button>
            </div>
          </div>
        )}
      </div>

      <NewAssignmentModal open={newOpen} onClose={() => setNewOpen(false)} />
      <RaftSimulatorModal open={raftSimOpen} onClose={() => setRaftSimOpen(false)} />
    </div>
  );
}
