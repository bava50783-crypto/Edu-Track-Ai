import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  GraduationCap,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import { DiagnosticModal, NewAssignmentModal, PostAnnouncementModal } from './Modals.tsx';

export function FacultyView() {
  const {
    waivers,
    resolveWaiver,
    discussions,
    replyDiscussion,
    facultySchedule,
    setActiveNav,
    showToast,
  } = useWorkspace();

  const [trackerTab, setTrackerTab] = useState<'active' | 'review' | 'archived'>('active');
  const [postAnnOpen, setPostAnnOpen] = useState(false);
  const [createAssignOpen, setCreateAssignOpen] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState('');

  const [diagOpen, setDiagOpen] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagQuestions, setDiagQuestions] = useState<
    Array<{ question: string; options: string[]; answerIndex: number; rationale: string }>
  >([]);

  const pendingWaiver = waivers.find((w) => w.status === 'pending') || waivers[0];

  const handlePublishDiagnostic = async () => {
    setDiagOpen(true);
    setDiagLoading(true);
    try {
      const res = await fetch('/api/ai/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'CS301 Raft Leader Election election-timeout jitter calculations under split-vote network partitions',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Diagnostic generation failed');
      setDiagQuestions(data.questions || []);
      showToast('Published 5-Min CS301 Micro-Diagnostic');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setDiagLoading(false);
    }
  };

  const handleExportCsv = () => {
    const csv = [
      'StudentID,Name,Section,Score,Grade,Status',
      'EDU-9942,Alex Vance,CS450 Section B,95,A,Released',
      'EDU-9811,Elena Lin,CS450 Section B,92,A-,Released',
      'EDU-9704,Devon Kim,CS450 Section B,89,B+,Released',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CS450_SectionB_Grades.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported CS450 gradebook CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#414CCE] font-bold">
              FACULTY PORTAL
            </span>
            <span className="text-[#81879C] font-medium">Academic Year 2024–2025</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#141936] mt-1">
            Faculty Portal &amp; Course Overview
          </h1>
          <p className="text-sm text-[#454654]">
            Welcome back, <strong className="text-[#141936]">Dr. Aris Thorne</strong> • Computer Science
            Department
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveNav('dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC]"
          >
            <Eye className="w-3.5 h-3.5 text-[#414CCE]" />
            View as Student
          </button>
          <button
            onClick={() => setPostAnnOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF]"
          >
            + Post Announcement
          </button>
          <button
            onClick={() => setCreateAssignOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              ACTIVE COURSE TASKS
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#414CCE]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">24</span>
            <span className="text-xs text-[#454654]">tasks active</span>
          </div>
          <div className="text-xs text-[#81879C] mt-1">Across 3 class sections • 2 modules closing</div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs font-semibold text-[#414CCE]">
            • CS301 (A &amp; B), CS450 (A)
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              COHORT TURN-IN RATE
            </span>
            <TrendingUp className="w-4 h-4 text-[#414CCE]" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">86%</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[11px] font-bold">
              ↑ +4%
            </span>
          </div>
          <div className="text-xs text-[#81879C] mt-1">vs. Midterm submission avg</div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#81879C]">Target: 85%</span>
            <span className="font-bold text-[#141936]">Exceeding Pace</span>
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              ENROLLED LEARNERS
            </span>
            <Users className="w-4 h-4 text-[#5C4BC3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">142</span>
            <span className="text-xs text-[#454654]">active seats</span>
          </div>
          <div className="text-xs text-[#454654] mt-1 tabular-nums">• CS301: 94 &nbsp; • CS450: 48</div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-[#414CCE] w-[66%] rounded-full" />
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
              PENDING REVIEWS
            </span>
            <ClipboardList className="w-4 h-4 text-[#414CCE]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#141936] tabular-nums">41</span>
            <span className="text-xs font-semibold text-[#BA1A1A]">Submissions</span>
          </div>
          <div className="mt-2 px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] text-[11px] font-semibold inline-block">
            38 AI Pre-graded &amp; Verified
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#81879C]">
            <span>Est. Instructor time:</span>
            <span className="font-bold text-[#414CCE]">~22 minutes</span>
          </div>
        </div>
      </div>

      {/* Exception Request Banner */}
      {pendingWaiver && (
        <div className="card-elevated rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-[#FFE9E9] text-[#BA1A1A] font-bold">
                  EXCEPTION REQUEST
                </span>
                <span className="text-[#81879C]">{pendingWaiver.receivedLabel}</span>
                {pendingWaiver.status !== 'pending' && (
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase">
                    {pendingWaiver.status}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[#141936]">
                <strong>{pendingWaiver.studentName}</strong> submitted{' '}
                <span className="text-[#414CCE] font-semibold">{pendingWaiver.assignmentTitle}</span> with a{' '}
                {pendingWaiver.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => showToast('Medical documentation verified by Student Health Office')}
              className="px-3 py-1.5 rounded-xl bg-[#F7F8FC] text-xs font-semibold text-[#454654] hover:text-[#141936]"
            >
              Review Waiver
            </button>
            <button
              onClick={() => resolveWaiver(pendingWaiver.id, 'rejected')}
              className="px-3 py-1.5 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] text-xs font-semibold hover:bg-rose-200"
            >
              Reject
            </button>
            <button
              onClick={() => resolveWaiver(pendingWaiver.id, 'approved')}
              className="px-4 py-1.5 rounded-xl bg-[#414CCE] text-white text-xs font-semibold hover:bg-[#3540B8]"
            >
              Approve +48h
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Faculty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Grading Tracker & Mastery Breakdown (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card-elevated rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#141936]">
                  Course Assignments &amp; Grading Tracker
                </h2>
                <p className="text-xs text-[#81879C]">
                  Live turn-in streams, automatic rubrics, and rapid moderation
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7F8FC]">
                {[
                  { id: 'active', label: 'All Active' },
                  { id: 'review', label: 'Needs Review (1)' },
                  { id: 'archived', label: 'Archived' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTrackerTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                      trackerTab === tab.id
                        ? 'bg-white text-[#414CCE] shadow-sm'
                        : 'text-[#454654] hover:text-[#141936]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CS301 Card */}
            {trackerTab !== 'archived' && (
              <div className="p-5 rounded-2xl bg-[#F7F8FC] border border-slate-200/70 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EEF3FF] text-[#414CCE] font-bold text-xs flex items-center justify-center shrink-0">
                      CS 301
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-white text-[#454654] font-semibold">
                          Section A • 48 Students
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#EEF3FF] text-[#414CCE] font-semibold">
                          Due Mar 24, 11:59 PM
                        </span>
                        <span className="text-[#414CCE] font-semibold">• Grading in Progress</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-[#141936]">
                        Distributed Consensus Protocol (Raft Implementation)
                      </h3>
                      <p className="text-xs text-[#454654] mt-0.5">
                        Unit test testbeds, state transition diagrams &amp; RPC logs
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-[#141936] tabular-nums">41 / 48 turned in</div>
                    <div className="text-xs font-semibold text-[#414CCE] tabular-nums">85% cohort completion</div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#414CCE] w-[85%] rounded-full" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[#414CCE] font-medium">
                    38 Submissions pre-scored with 99.2% confidence · 7 pending before cutoff
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => showToast('Auto-Grade Sync completed for 38 submissions')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-[#141936] hover:bg-[#EEF3FF]"
                    >
                      Auto-Grade Sync
                    </button>
                    <button
                      onClick={() => setActiveNav('assignments')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-[#141936] hover:bg-[#EEF3FF]"
                    >
                      Edit Rubric
                    </button>
                    <button
                      onClick={() => setActiveNav('assignments')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#414CCE] text-white font-semibold hover:bg-[#3540B8]"
                    >
                      Review Submissions (41)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CS450 Card */}
            {trackerTab !== 'review' && (
              <div className="p-5 rounded-2xl bg-[#F7F8FC] border border-slate-200/70 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F4F2FF] text-[#5C4BC3] font-bold text-xs flex items-center justify-center shrink-0">
                      CS 450
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-white text-[#454654] font-semibold">
                          Section B • 36 Students
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white text-[#454654] font-semibold">
                          Due Mar 18 (Closed)
                        </span>
                        <span className="text-emerald-700 font-semibold">✓ Graded &amp; Released</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-[#141936]">
                        Cloud Native Microservices &amp; Service Mesh Lab
                      </h3>
                      <p className="text-xs text-[#454654] mt-0.5">
                        Kubernetes manifests, Istio routing policies &amp; Canary telemetry verification
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-[#141936] tabular-nums">36 / 36 (100%)</div>
                    <div className="text-xs font-semibold text-[#414CCE] tabular-nums">
                      Mean: 91.4 / 100 (A-)
                    </div>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#5C4BC3] w-full rounded-full" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[#454654]">
                    All 36 grade packages published to university Registrar SIS · High: 99.0 | Low: 81.5
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-[#141936] hover:bg-[#EEF3FF]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => showToast('Mean: 91.4 | Median: 92.0 | StdDev: 4.1')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-[#141936] hover:bg-[#EEF3FF]"
                    >
                      Score Distribution
                    </button>
                    <button
                      onClick={() => setActiveNav('assignments')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-[#141936] hover:bg-[#EEF3FF]"
                    >
                      View Full Gradebook
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Curriculum Mastery Breakdown */}
          <div className="card-elevated rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#141936]">Curriculum Mastery Breakdown</h3>
                <p className="text-xs text-[#81879C]">
                  Algorithmic comprehension ratings derived from auto-graded test vectors
                </p>
              </div>
              <span className="text-xs font-semibold text-[#414CCE]">Real-time update</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70">
                <div className="text-[11px] font-bold text-[#81879C] uppercase">CONSENSUS &amp; QUORUMS</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#141936] tabular-nums">72%</span>
                  <span className="text-xs font-semibold text-[#BA1A1A]">Needs review</span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#BA1A1A] w-[72%] rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70">
                <div className="text-[11px] font-bold text-[#81879C] uppercase">
                  FAULT TOLERANCE &amp; HEARTBEATS
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#141936] tabular-nums">89%</span>
                  <span className="text-xs font-semibold text-[#414CCE]">Target met</span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#414CCE] w-[89%] rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70">
                <div className="text-[11px] font-bold text-[#81879C] uppercase">
                  LOG COMPACTION &amp; SNAPSHOTS
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#141936] tabular-nums">94%</span>
                  <span className="text-xs font-semibold text-emerald-700">Advanced</span>
                </div>
                <div className="mt-2.5 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-[#5C4BC3] w-[94%] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Bottleneck Alert, Discussion Queue, Schedule (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Bottleneck Alert */}
          <div className="card-elevated rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#141936]">
              <div className="w-7 h-7 rounded-lg bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              AI Bottleneck Alert
            </div>

            <div className="p-4 rounded-xl bg-[#FFF5F5] border border-[#FECACA] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#BA1A1A] uppercase">
                <AlertTriangle className="w-3.5 h-3.5" />
                RECURRING LOGIC HAZARD DETECTED
              </div>
              <p className="text-xs text-[#141936] leading-relaxed">
                AI Assistant flagged that <strong>68% of incorrect assertions</strong> in{' '}
                <span className="text-[#414CCE] font-semibold">CS301 Section A</span> stem from{' '}
                <em>Raft Leader Election</em> election-timeout jitter calculations under split-vote network
                partitions.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 rounded-full bg-rose-200 overflow-hidden">
                  <div className="h-full bg-[#BA1A1A] w-[68%] rounded-full" />
                </div>
                <span className="text-[11px] font-bold text-[#BA1A1A] tabular-nums">68% err</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#81879C] uppercase">SUGGESTED REMEDIATION:</div>
              <p className="mt-1 text-xs text-[#454654]">
                Deploy a 5-question micro-diagnostic to resolve election-timeout race conditions before
                Friday&apos;s quiz.
              </p>
            </div>

            <button
              onClick={handlePublishDiagnostic}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95"
            >
              <Zap className="w-3.5 h-3.5" />
              Publish 5-Min Diagnostic
            </button>
          </div>

          {/* Discussion Queue */}
          <div className="card-elevated rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#414CCE]" />
                <h3 className="text-sm font-bold text-[#141936]">Discussion Queue</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#414CCE] text-[11px] font-bold">
                {discussions.filter((d) => !d.resolved).length} Unread
              </span>
            </div>

            <div className="space-y-3">
              {discussions.map((d) => (
                <div key={d.id} className="p-3.5 rounded-xl bg-[#F7F8FC] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#EEF3FF] text-[#414CCE] font-bold text-[10px] flex items-center justify-center">
                        {d.initials}
                      </span>
                      <div>
                        <div className="font-bold text-[#141936]">{d.studentName}</div>
                        <div className="text-[10px] text-[#81879C]">
                          {d.courseCode} • {d.threadNumber}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#81879C]">{d.timeAgo}</span>
                  </div>

                  <p className="text-xs text-[#454654] line-clamp-2">{d.question}</p>

                  {d.replyText && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-[11px]">
                      <strong>Your Reply:</strong> {d.replyText}
                    </div>
                  )}

                  {activeReplyId === d.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={2}
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-xs text-[#141936]"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="text-xs text-[#81879C]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            await replyDiscussion(d.id, replyDraft, true);
                            setActiveReplyId(null);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#414CCE] text-white text-xs font-semibold"
                        >
                          <Send className="w-3 h-3" />
                          Post &amp; Resolve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1">
                      {d.resolved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <Check className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setActiveReplyId(d.id);
                              setReplyDraft(d.aiDraft || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] font-semibold"
                          >
                            {d.aiDraft ? 'AI Draft Ready' : 'Reply Directly'}
                          </button>
                          <button
                            onClick={() => replyDiscussion(d.id, d.aiDraft || 'Resolved in office hours', true)}
                            className="font-semibold text-[#414CCE] hover:underline"
                          >
                            Mark Resolved
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Schedule & Office Hours */}
          <div className="card-elevated rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#141936]">Schedule &amp; Office Hours</h3>
                <p className="text-[11px] text-[#81879C]">Today, Tuesday Mar 19</p>
              </div>
              <Calendar className="w-4 h-4 text-[#414CCE]" />
            </div>

            <div className="space-y-2.5">
              {facultySchedule.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#F7F8FC] flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-[#141936]">{item.title}</div>
                    <div className="text-[11px] text-[#81879C] mt-0.5">
                      {item.timeRange} • {item.location}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#EEF3FF] text-[#414CCE] text-[10px] font-bold shrink-0">
                    {item.badgeText}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('Office hours booking slots synced')}
              className="w-full py-2.5 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-xs font-semibold text-[#141936]"
            >
              Manage Booking Slots
            </button>
          </div>
        </div>
      </div>

      <PostAnnouncementModal open={postAnnOpen} onClose={() => setPostAnnOpen(false)} />
      <NewAssignmentModal open={createAssignOpen} onClose={() => setCreateAssignOpen(false)} />
      <DiagnosticModal
        open={diagOpen}
        onClose={() => setDiagOpen(false)}
        questions={diagQuestions}
        loading={diagLoading}
      />
    </div>
  );
}
