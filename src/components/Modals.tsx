import React, { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';

export function NewAssignmentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { courses, createAssignment } = useWorkspace();
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('CS301');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueLabel, setDueLabel] = useState('Apr 05, 11:59 PM');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Normal'>('Medium');
  const [weightPct, setWeightPct] = useState(15);
  const [estimatedMins, setEstimatedMins] = useState(60);

  if (!open) return null;

  const selectedCourse = courses.find((c) => c.code === courseCode) || courses[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createAssignment({
      courseCode,
      courseName: selectedCourse?.name || courseCode,
      instructor: selectedCourse?.instructor || 'Dr. Aris Thorne',
      title: title.trim(),
      subtitle: subtitle.trim() || 'Coursework Deliverable',
      description: description.trim() || 'Complete deliverables according to syllabus rubric.',
      dueLabel,
      countdownLabel: 'Due in 5 days',
      priority,
      weightPct,
      estimatedMins,
    });
    setTitle('');
    setSubtitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141936]/35 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#141936]">Create New Assignment</h3>
            <p className="text-xs text-[#81879C]">Add a deliverable to your academic pipeline</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#81879C] hover:bg-[#F7F8FC] hover:text-[#141936]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Course</label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] bg-white focus:border-[#5B67E8] focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] bg-white focus:border-[#5B67E8] focus:outline-none"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">Assignment Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., CS301: Snapshot Log Compaction Lab"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] focus:border-[#5B67E8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Due Date</label>
              <input
                value={dueLabel}
                onChange={(e) => setDueLabel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] focus:border-[#5B67E8] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Weight (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={weightPct}
                onChange={(e) => setWeightPct(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] tabular-nums focus:border-[#5B67E8] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Est. Mins</label>
              <input
                type="number"
                min={10}
                max={300}
                value={estimatedMins}
                onChange={(e) => setEstimatedMins(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] tabular-nums focus:border-[#5B67E8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">Deliverable Subtitle</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., Go test suite + technical memo"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] focus:border-[#5B67E8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">Instructions</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe rubric criteria, submission format, and edge cases..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm text-[#141936] focus:border-[#5B67E8] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#454654] hover:bg-[#F7F8FC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#414CCE] text-white text-sm font-semibold hover:bg-[#3540B8] shadow-sm"
            >
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PostAnnouncementModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { createAnnouncement } = useWorkspace();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Dept of Computer Science');
  const [category, setCategory] = useState('Urgent Alert');
  const [courseRef, setCourseRef] = useState('CS301');
  const [body, setBody] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await createAnnouncement({
      department,
      author: 'Dr. Aris Thorne',
      authorRole: 'CS Dept Head',
      title: title.trim(),
      body: body.trim(),
      category,
      priority: category === 'Urgent Alert' ? 'High Priority / Mandatory' : 'Normal',
      courseRef,
    });
    setTitle('');
    setBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141936]/35 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200/80">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#141936]">Post Departmental Announcement</h3>
            <p className="text-xs text-[#81879C]">Broadcasts immediately to the student Announcements feed</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#81879C] hover:bg-[#F7F8FC] hover:text-[#141936]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936] bg-white"
              >
                <option value="Urgent Alert">Urgent Alert</option>
                <option value="Facility Notice">Facility Notice</option>
                <option value="Policy Advisory">Policy Advisory</option>
                <option value="Keynote Seminar">Keynote Seminar</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#454654] mb-1">Course / Ref</label>
              <input
                value={courseRef}
                onChange={(e) => setCourseRef(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">Headline</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., CS301 Midterm Practice Lab Extended to 8 PM"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-[#141936]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">Notice Body</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter full departmental instructions, room details, and action items..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm text-[#141936]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#454654] hover:bg-[#F7F8FC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#414CCE] text-white text-sm font-semibold hover:bg-[#3540B8]"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PomodoroModal({
  open,
  onClose,
  focusTitle,
}: {
  open: boolean;
  onClose: () => void;
  focusTitle: string;
}) {
  const { logStudyHours } = useWorkspace();
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!open || !running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [open, running]);

  if (!open) return null;

  const mins = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141936]/35 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#414CCE]">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Pomodoro Focus Window</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#81879C] hover:bg-[#F7F8FC]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-6 text-center">
          <p className="text-sm font-semibold text-[#141936] line-clamp-2">{focusTitle}</p>
          <div className="my-5 text-5xl font-bold font-mono tabular-nums text-[#414CCE]">
            {mins}:{secs}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#414CCE] text-white text-sm font-semibold hover:bg-[#3540B8]"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={() => {
                setSecondsLeft(25 * 60);
                setRunning(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-[#81879C]">Log completed study block</span>
          <button
            onClick={async () => {
              await logStudyHours(0.5);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete & Log +0.5h
          </button>
        </div>
      </div>
    </div>
  );
}

export function RaftSimulatorModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [randomized, setRandomized] = useState(true);
  const [step, setStep] = useState(1);

  if (!open) return null;

  const nodes = randomized
    ? [
        { id: 'Node A', role: step >= 2 ? 'Leader' : 'Candidate', term: 'T+1', timer: '162ms', votes: step >= 2 ? 2 : 1 },
        { id: 'Node B', role: 'Follower', term: 'T+1', timer: '248ms', votes: 0 },
        { id: 'Node C', role: 'Follower', term: 'T+1', timer: '281ms', votes: 0 },
      ]
    : [
        { id: 'Node A', role: 'Candidate', term: `T+${step}`, timer: '200ms', votes: 1 },
        { id: 'Node B', role: 'Candidate', term: `T+${step}`, timer: '200ms', votes: 1 },
        { id: 'Node C', role: 'Follower', term: `T+${step}`, timer: '200ms', votes: 1 },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141936]/35 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#141936]">CS301 Raft 3-Node Election Simulator</h3>
            <p className="text-xs text-[#81879C]">
              Compare static election timers (split-vote livelock) vs randomized [150ms, 300ms] jitter
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[#81879C] hover:bg-[#F7F8FC]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-[#F7F8FC] p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRandomized(true);
                setStep(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                randomized ? 'bg-[#414CCE] text-white' : 'bg-white text-[#454654]'
              }`}
            >
              Randomized [150ms–300ms]
            </button>
            <button
              onClick={() => {
                setRandomized(false);
                setStep(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                !randomized ? 'bg-[#BA1A1A] text-white' : 'bg-white text-[#454654]'
              }`}
            >
              Static 200ms (Split-Vote)
            </button>
          </div>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF]"
          >
            <Zap className="w-3.5 h-3.5" />
            Advance Election Tick (Step {step})
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 my-5">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`p-4 rounded-xl border text-center transition-colors ${
                node.role === 'Leader'
                  ? 'bg-[#414CCE] text-white border-[#414CCE]'
                  : node.role === 'Candidate'
                  ? 'bg-[#EEF3FF] text-[#141936] border-[#5B67E8]'
                  : 'bg-white text-[#141936] border-slate-200'
              }`}
            >
              <div className="text-sm font-bold">{node.id}</div>
              <div className="text-xs opacity-80 mt-0.5">{node.role}</div>
              <div className="mt-3 font-mono text-xs tabular-nums">
                Timer: <span className="font-semibold">{node.timer}</span>
              </div>
              <div className="font-mono text-xs tabular-nums mt-1">
                Term: {node.term} · Votes: {node.votes}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-[#F4F2FF] text-xs text-[#454654]">
          {randomized ? (
            <span>
              <strong className="text-[#414CCE]">Quorum Achieved:</strong> Node A timed out first at 162ms,
              incremented term to T+1, and secured 2/3 majority votes before Node B (248ms) initiated an
              election.
            </span>
          ) : (
            <span>
              <strong className="text-[#BA1A1A]">Split-Vote Livelock (Round {step}):</strong> Node A and
              Node B timed out simultaneously at 200ms, each receiving only 1 vote. No candidate reaches
              quorum (Q = 2).
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DiagnosticModal({
  open,
  onClose,
  questions,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  questions: Array<{ question: string; options: string[]; answerIndex: number; rationale: string }>;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141936]/35 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5C4BC3]" />
            <h3 className="text-lg font-bold text-[#141936]">5-Min CS301 Micro-Diagnostic (AI Generated)</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-[#81879C] hover:bg-[#F7F8FC]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <Activity className="w-7 h-7 text-[#5B67E8] animate-spin mx-auto" />
            <p className="text-sm text-[#454654]">Synthesizing 5 remediation questions via Gemini...</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70">
                <p className="text-sm font-semibold text-[#141936]">
                  {idx + 1}. {q.question}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-[#454654]">
                  {(q.options || []).map((opt, oIdx) => (
                    <li
                      key={oIdx}
                      className={`px-2.5 py-1.5 rounded-lg ${
                        oIdx === q.answerIndex
                          ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                          : 'bg-white'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[#5C4BC3]">Rationale: {q.rationale}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, dbSynced, signInWithGoogle, logout } = useWorkspace();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141936]/35 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[#141936]">Account & Workspace Settings</h3>
          <button onClick={onClose} className="p-2 rounded-lg text-[#81879C] hover:bg-[#F7F8FC]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/80">
            <div className="text-xs font-semibold text-[#81879C] uppercase tracking-wider">
              Authenticated Session
            </div>
            {user ? (
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#141936]">{user.displayName || 'Google User'}</div>
                  <div className="text-xs text-[#454654]">{user.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <UserCheck className="w-3.5 h-3.5" />
                    {dbSynced ? 'Synced with PostgreSQL' : 'Syncing...'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <p className="text-xs text-[#454654]">
                  Sign in with Google to persist assignments, study documents, rubrics, and AI Copilot sessions
                  across devices.
                </p>
                <button
                  onClick={signInWithGoogle}
                  className="w-full py-2.5 rounded-xl bg-[#414CCE] text-white text-sm font-semibold hover:bg-[#3540B8]"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
