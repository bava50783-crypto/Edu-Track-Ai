import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  MessageSquareText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';

export function AnalyticsView() {
  const {
    customers,
    customerResponses,
    assignments,
    courses,
    academicRecords,
    updateAcademicAttendance,
    studyGoal,
    chatSessions,
    setActiveNav,
    showToast,
  } = useWorkspace();

  const metrics = useMemo(() => {
    const totalResp = customerResponses.length;
    const pending = customerResponses.filter((r) => r.status === 'Pending').length;
    const responded = customerResponses.filter((r) => r.status === 'Responded').length;
    const resolved = customerResponses.filter((r) => r.status === 'Resolved').length;

    const resolutionRate = totalResp > 0 ? Math.round(((responded + resolved) / totalResp) * 100) : 0;

    const highPriority = customerResponses.filter((r) => r.priority === 'High').length;
    const mediumPriority = customerResponses.filter((r) => r.priority === 'Medium').length;
    const lowPriority = customerResponses.filter((r) => r.priority === 'Low').length;

    const channels = {
      'Support Portal': customerResponses.filter((r) => r.channel === 'Support Portal').length,
      Email: customerResponses.filter((r) => r.channel === 'Email').length,
      'Live Chat': customerResponses.filter((r) => r.channel === 'Live Chat').length,
    };

    const totalMessages = chatSessions.reduce((acc, s) => acc + s.messages.length, 0);
    const completedAssignments = assignments.filter((a) => a.status === 'completed').length;
    const assignmentPct =
      assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;

    const totalCredits = academicRecords.reduce((s, r) => s + r.credits, 0);
    const weightedGpa = academicRecords.reduce(
      (s, r) => s + r.credits * (r.gradePointsTenths / 10),
      0
    );
    const cgpa = totalCredits > 0 ? (weightedGpa / totalCredits).toFixed(2) : '0.00';
    const totalAttended = academicRecords.reduce((s, r) => s + r.classesAttended, 0);
    const totalHeld = academicRecords.reduce((s, r) => s + r.totalClasses, 0);
    const overallAttendancePct =
      totalHeld > 0 ? ((totalAttended / totalHeld) * 100).toFixed(1) : '0.0';

    return {
      totalResp,
      pending,
      responded,
      resolved,
      resolutionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      channels,
      totalMessages,
      assignmentPct,
      completedAssignments,
      cgpa,
      totalCredits,
      overallAttendancePct,
    };
  }, [customerResponses, chatSessions, assignments, academicRecords]);

  const handleExportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Student CGPA', `${metrics.cgpa} / 4.00`],
      ['Overall Attendance (%)', `${metrics.overallAttendancePct}%`],
      ['Total Customers', String(customers.length)],
      ['Total Customer Responses', String(metrics.totalResp)],
      ['Pending Responses', String(metrics.pending)],
      ['Responded Responses', String(metrics.responded)],
      ['Resolved Responses', String(metrics.resolved)],
      ['Response Handling Rate (%)', String(metrics.resolutionRate)],
      ['Chatbot Sessions', String(chatSessions.length)],
      ['Chatbot Messages', String(metrics.totalMessages)],
      ['Completed Assignments', `${metrics.completedAssignments}/${assignments.length}`],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'edutrack_analytics_report.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported analytics summary CSV');
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxDaily = Math.max(4, ...studyGoal.dailyHoursJson);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#414CCE]">
            <span>ACADEMIC PERFORMANCE &amp; OPERATIONS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141936] mt-0.5">
            Analytics, Attendance &amp; CGPA
          </h1>
          <p className="text-sm text-[#454654] mt-0.5">
            Real-time student attendance, marks, CGPA breakdown, and customer response operations.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#141936] hover:bg-[#F7F8FC] whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-[#414CCE]" />
          Export Report (CSV)
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#81879C] uppercase">
            <span>Current CGPA</span>
            <Award className="w-4 h-4 text-[#414CCE]" />
          </div>
          <div className="text-3xl font-extrabold text-[#141936] tabular-nums">
            {metrics.cgpa}
          </div>
          <div className="text-xs text-[#454654]">
            Weighted across {metrics.totalCredits} credits (4.00 scale)
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#81879C] uppercase">
            <span>Overall Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#141936] tabular-nums">
            {metrics.overallAttendancePct}%
          </div>
          <div className="text-xs text-[#454654]">Target threshold: 75.0% per course</div>
        </div>

        <div className="card-elevated rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#81879C] uppercase">
            <span>Response Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#141936] tabular-nums">
            {metrics.resolutionRate}%
          </div>
          <div className="text-xs text-[#454654]">
            {metrics.pending} pending • {metrics.responded + metrics.resolved} answered
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#81879C] uppercase">
            <span>Assistant Volume</span>
            <MessageSquareText className="w-4 h-4 text-[#5C4BC3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#141936] tabular-nums">
            {metrics.totalMessages}
          </div>
          <button
            onClick={() => setActiveNav('chatbot')}
            className="text-xs font-semibold text-[#414CCE] hover:underline"
          >
            Ask EduTrack AI Assistant &rarr;
          </button>
        </div>
      </div>

      {/* Student Attendance, Marks & Timetable Table */}
      <div className="card-elevated rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#141936]">
              Subject-Wise Attendance, Marks &amp; Timetable
            </h2>
            <p className="text-xs text-[#81879C]">
              Live records synced with PostgreSQL and accessible to EduTrack AI Assistant.
            </p>
          </div>
          <button
            onClick={() => setActiveNav('chatbot')}
            className="px-3.5 py-2 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-bold hover:bg-[#E0E7FF] self-start sm:self-auto"
          >
            Ask Assistant for Study Plan
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[#81879C] uppercase text-[10px] tracking-wider">
                <th className="py-2.5 pr-4">Course</th>
                <th className="py-2.5 px-3">Timetable</th>
                <th className="py-2.5 px-3">Marks &amp; Grade</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 pl-3 text-right">Log Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {academicRecords.map((rec) => {
                const attPct = Number(
                  ((rec.classesAttended / Math.max(1, rec.totalClasses)) * 100).toFixed(1)
                );
                const shortage = attPct < rec.targetAttendancePct;
                const needed = shortage
                  ? Math.max(
                      0,
                      Math.ceil(
                        (rec.targetAttendancePct * rec.totalClasses -
                          100 * rec.classesAttended) /
                          (100 - rec.targetAttendancePct)
                      )
                    )
                  : 0;

                return (
                  <tr key={rec.id} className="hover:bg-[#F7F8FC]/60">
                    <td className="py-3 pr-4">
                      <div className="font-bold text-[#141936]">
                        {rec.courseCode} • {rec.courseName}
                      </div>
                      <div className="text-[11px] text-[#81879C]">{rec.credits} Credits</div>
                    </td>
                    <td className="py-3 px-3 text-[#454654]">{rec.timetableSlot}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#141936] tabular-nums">{rec.marksPct}%</span>{' '}
                      <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] font-bold text-[10px]">
                        {rec.letterGrade} ({(rec.gradePointsTenths / 10).toFixed(1)})
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold tabular-nums ${
                            shortage ? 'text-[#BA1A1A]' : 'text-emerald-700'
                          }`}
                        >
                          {rec.classesAttended}/{rec.totalClasses} ({attPct}%)
                        </span>
                        {shortage && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFE9E9] text-[#BA1A1A] text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            Need +{needed}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() =>
                          updateAcademicAttendance(
                            rec.id,
                            rec.classesAttended + 1,
                            rec.totalClasses + 1
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                      >
                        + Attended
                      </button>
                      <button
                        onClick={() =>
                          updateAcademicAttendance(
                            rec.id,
                            rec.classesAttended,
                            rec.totalClasses + 1
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#FFF5F5] text-[#BA1A1A] font-bold hover:bg-[#FFE9E9]"
                      >
                        + Missed
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Response Status & Priority */}
        <div className="lg:col-span-6 card-elevated rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#141936] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#414CCE]" />
              Customer Response Status Breakdown
            </h2>
            <span className="text-xs text-[#81879C] tabular-nums">{metrics.totalResp} total</span>
          </div>

          <div className="space-y-3.5">
            {[
              { label: 'Pending', count: metrics.pending, color: 'bg-amber-500' },
              { label: 'Responded', count: metrics.responded, color: 'bg-[#414CCE]' },
              { label: 'Resolved', count: metrics.resolved, color: 'bg-emerald-600' },
            ].map((row) => {
              const pct = metrics.totalResp > 0 ? Math.round((row.count / metrics.totalResp) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#141936]">{row.label}</span>
                    <span className="text-[#454654] tabular-nums">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#FFF5F5]">
              <div className="text-[11px] font-bold text-[#BA1A1A]">High Priority</div>
              <div className="text-lg font-extrabold text-[#141936] tabular-nums mt-0.5">
                {metrics.highPriority}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#EEF3FF]">
              <div className="text-[11px] font-bold text-[#414CCE]">Medium Priority</div>
              <div className="text-lg font-extrabold text-[#141936] tabular-nums mt-0.5">
                {metrics.mediumPriority}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FC]">
              <div className="text-[11px] font-bold text-[#454654]">Low Priority</div>
              <div className="text-lg font-extrabold text-[#141936] tabular-nums mt-0.5">
                {metrics.lowPriority}
              </div>
            </div>
          </div>
        </div>

        {/* Channel Mix & Study Velocity */}
        <div className="lg:col-span-6 card-elevated rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#141936] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#414CCE]" />
              Channel Intake &amp; Weekly Academic Cadence
            </h2>
            <span className="text-xs font-semibold text-[#414CCE] tabular-nums">
              {(studyGoal.loggedTenths / 10).toFixed(1)}h / {studyGoal.targetHours}h goal
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {Object.entries(metrics.channels).map(([channel, count]) => (
              <div
                key={channel}
                className="p-3.5 rounded-xl bg-[#F7F8FC] border border-slate-200/70"
              >
                <div className="text-[11px] font-semibold text-[#81879C]">{channel}</div>
                <div className="text-xl font-extrabold text-[#141936] tabular-nums mt-1">
                  {count}
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Bar Chart */}
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C] mb-3">
              Daily Study Hours (Spring Term)
            </div>
            <div className="h-32 flex items-end justify-between gap-2.5 px-2">
              {studyGoal.dailyHoursJson.map((hrs, idx) => {
                const heightPct = Math.max(10, Math.round((hrs / maxDaily) * 100));
                return (
                  <div
                    key={days[idx]}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                  >
                    <span className="text-[10px] font-bold text-[#454654] tabular-nums">
                      {hrs}h
                    </span>
                    <div className="w-full bg-[#EEF3FF] rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-[#414CCE] rounded-t-lg transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#81879C]">{days[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Course Completion Progress */}
      <div className="card-elevated rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#141936] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#414CCE]" />
            Course Syllabus Completion &amp; Active Customers ({customers.length})
          </h2>
          <span className="text-xs font-bold text-[#414CCE] tabular-nums">
            {metrics.assignmentPct}% Overall Assignment Completion
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((c) => (
            <div
              key={c.code}
              className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#414CCE]">{c.code}</span>
                <span className="text-[#141936] tabular-nums">{c.completionPct}%</span>
              </div>
              <div className="text-xs font-semibold text-[#141936] truncate">{c.name}</div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#414CCE]"
                  style={{ width: `${c.completionPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
