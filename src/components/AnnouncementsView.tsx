import React, { useMemo, useState } from 'react';
import {
  Bell,
  Bookmark,
  CalendarPlus,
  Check,
  CheckCheck,
  CheckCircle2,
  Download,
  FileText,
  MapPin,
  Pin,
  Printer,
  Share2,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';

export function AnnouncementsView() {
  const {
    announcements,
    selectedAnnouncementId,
    setSelectedAnnouncementId,
    toggleAnnouncementStar,
    markAnnouncementRead,
    acknowledgeAnnouncement,
    markAllAnnouncementsRead,
    globalSearch,
    showToast,
  } = useWorkspace();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'URGENT' | 'EXAMS' | 'ASSIGNMENTS'>('ALL');
  const [starredOnly, setStarredOnly] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const departments = useMemo(
    () => Array.from(new Set(announcements.map((a) => a.department))),
    [announcements]
  );

  const filtered = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    return announcements.filter((a) => {
      if (starredOnly && !a.starred) return false;
      if (departmentFilter !== 'ALL' && a.department !== departmentFilter) return false;
      if (categoryFilter === 'URGENT' && a.category !== 'Urgent Alert') return false;
      if (categoryFilter === 'EXAMS' && !a.title.toLowerCase().includes('exam') && !a.title.toLowerCase().includes('midterm')) {
        return false;
      }
      if (q && !`${a.title} ${a.department} ${a.body}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [announcements, categoryFilter, starredOnly, departmentFilter, globalSearch]);

  const active = announcements.find((a) => a.id === selectedAnnouncementId) || filtered[0] || announcements[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#141936]">Announcements</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold">
              Live Feed
            </span>
          </div>
          <p className="text-sm text-[#454654] mt-0.5">
            Stay updated with verified department notices, academic alerts, and campus events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={markAllAnnouncementsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF]"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All as Read
          </button>
          <button
            onClick={() => setStarredOnly((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              starredOnly
                ? 'bg-[#414CCE] text-white'
                : 'bg-white border border-slate-200 text-[#141936] hover:bg-[#F7F8FC]'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Filter by Starred
          </button>
          <button
            onClick={() => showToast('Push & email alert preferences saved')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC]"
          >
            <Bell className="w-3.5 h-3.5" />
            Notification Settings
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `All (${announcements.length})` },
            {
              id: 'URGENT',
              label: `Urgent / Alerts (${announcements.filter((a) => a.category === 'Urgent Alert').length})`,
            },
            { id: 'EXAMS', label: 'Examinations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                categoryFilter === tab.id
                  ? 'bg-[#414CCE] text-white'
                  : 'bg-white border border-slate-200 text-[#454654] hover:text-[#141936]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936]"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Feed List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((item) => {
            const isSelected = active?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedAnnouncementId(item.id);
                  markAnnouncementRead(item.id);
                }}
                className={`p-4 rounded-2xl bg-white cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-[#414CCE] ring-2 ring-[#414CCE]/15 shadow-sm'
                    : 'border-slate-200/80 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        item.category === 'Urgent Alert'
                          ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                          : 'bg-[#EEF3FF] text-[#414CCE]'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#414CCE] text-[11px] font-semibold">
                        <Pin className="w-3 h-3" />
                        Pinned
                      </span>
                    )}
                    {!item.isRead && (
                      <span className="text-[10px] font-bold text-[#414CCE]">Unread</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#81879C]">{item.publishedLabel}</span>
                </div>

                <div className="mt-2.5 text-xs font-semibold text-[#454654]">
                  {item.department} • {item.author}
                </div>
                <h3 className="mt-1 text-sm font-bold text-[#141936] leading-snug">{item.title}</h3>
                <p className="mt-1 text-xs text-[#454654] line-clamp-2">{item.excerpt}</p>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tagsJson.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          tag === 'Action Required'
                            ? 'bg-[#BA1A1A] text-white'
                            : 'bg-[#F7F8FC] text-[#454654]'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAnnouncementStar(item.id);
                    }}
                    className={`p-1 rounded-lg ${
                      item.starred ? 'text-amber-500' : 'text-[#81879C] hover:text-amber-500'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={item.starred ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detailed Notice Viewer (7 cols) */}
        {active && (
          <div className="lg:col-span-7 space-y-5">
            <div className="card-elevated rounded-2xl p-6 space-y-5">
              {/* Department Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#414CCE] text-white flex items-center justify-center font-bold text-sm">
                    {active.courseRef.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#141936]">
                      {active.department}
                      <CheckCircle2 className="w-4 h-4 text-[#414CCE]" />
                    </div>
                    <div className="text-xs text-[#454654]">
                      {active.author} ({active.authorRole}) • {active.publishedLabel}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleAnnouncementStar(active.id)}
                    className="p-2 rounded-lg bg-[#EEF3FF] text-[#414CCE] hover:bg-[#E0E7FF]"
                    title="Star notice"
                  >
                    <Star className="w-4 h-4" fill={active.starred ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => showToast('Notice link copied to clipboard')}
                    className="p-2 rounded-lg hover:bg-[#F7F8FC] text-[#454654]"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showToast('Saved to reading bookmarks')}
                    className="p-2 rounded-lg hover:bg-[#F7F8FC] text-[#454654]"
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-lg hover:bg-[#F7F8FC] text-[#454654]"
                    title="Print"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metadata & Headline */}
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFE9E9] text-[#BA1A1A] font-semibold">
                    {active.priority}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] font-semibold">
                    {active.audience}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F7F8FC] text-[#454654] font-semibold">
                    {active.courseRef}
                  </span>
                </div>

                <h2 className="mt-3 text-xl font-bold text-[#141936] leading-snug">{active.title}</h2>
                <p className="mt-3 text-sm text-[#454654] leading-relaxed">{active.body}</p>
              </div>

              {/* Primary Session Box */}
              {active.sessionTitle && (
                <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
                      PRIMARY SESSION
                    </div>
                    <div className="text-sm font-bold text-[#141936] mt-0.5">{active.sessionTitle}</div>
                    <div className="text-xs font-medium text-[#414CCE] mt-0.5">{active.sessionTime}</div>
                  </div>
                  {active.sessionRoom && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      {active.sessionRoom}
                    </span>
                  )}
                </div>
              )}

              {/* Assigned Exam Seat & Hardware */}
              {active.seatStudentId && (
                <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#F7F8FC] border-b border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#141936]">Your Assigned Exam Seat &amp; Hardware</span>
                    <span className="text-[#81879C]">Authenticated via Student ID: {active.seatStudentId}</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-[#81879C] uppercase">Student ID</div>
                      <div className="font-bold text-[#414CCE] mt-1 font-mono">{active.seatStudentId}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#81879C] uppercase">Hall / Room</div>
                      <div className="font-semibold text-[#141936] mt-1">{active.sessionRoom}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#81879C] uppercase">Assigned Seat</div>
                      <div className="font-bold text-[#141936] mt-1">{active.seatRow}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#81879C] uppercase">Station Hardware</div>
                      <div className="font-medium text-[#454654] mt-1">{active.seatStation}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#81879C] uppercase">Chief Proctor</div>
                      <div className="font-medium text-[#454654] mt-1">{active.proctor}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Permitted & Prohibited Materials */}
              {(active.permittedJson.length > 0 || active.prohibitedJson.length > 0) && (
                <div>
                  <div className="text-xs font-bold text-[#141936] mb-2.5">
                    Permitted &amp; Restricted Materials
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Permitted in Exam Hall
                      </div>
                      <ul className="space-y-1.5 text-xs text-emerald-900">
                        {active.permittedJson.map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-2">
                        <ShieldAlert className="w-4 h-4" />
                        Strictly Prohibited
                      </div>
                      <ul className="space-y-1.5 text-xs text-rose-900">
                        {active.prohibitedJson.map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Official Attachments */}
              {active.attachmentsJson.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-[#141936] mb-2">
                    Official Attachments ({active.attachmentsJson.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {active.attachmentsJson.map((att, idx) => (
                      <button
                        key={idx}
                        onClick={() => showToast(`Downloading ${att.name}`)}
                        className="p-3 rounded-xl bg-[#F7F8FC] border border-slate-200/80 flex items-center justify-between gap-3 hover:border-[#414CCE] text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#FFE9E9] text-[#BA1A1A] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#141936] truncate">{att.name}</div>
                            <div className="text-[11px] text-[#81879C] truncate">{att.size}</div>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-[#414CCE] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => showToast('Accommodation request form opened for Accessibility Services')}
                  className="text-xs font-semibold text-[#414CCE] hover:underline"
                >
                  Request Disability Accommodation or Reschedule
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => markAnnouncementRead(active.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#F7F8FC] text-xs font-semibold text-[#454654] hover:bg-slate-200/60"
                  >
                    Dismiss Notice
                  </button>
                  <button
                    onClick={() => acknowledgeAnnouncement(active.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#414CCE] text-white text-xs font-semibold hover:bg-[#3540B8]"
                  >
                    {active.acknowledged ? <Check className="w-3.5 h-3.5" /> : <CalendarPlus className="w-3.5 h-3.5" />}
                    {active.acknowledged ? 'Acknowledged & Added' : 'Acknowledge & Add to Calendar'}
                  </button>
                </div>
              </div>
            </div>

            {/* 3 Mini Summary Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-elevated rounded-2xl p-4">
                <div className="text-[11px] font-semibold text-[#81879C]">Days Until Exam</div>
                <div className="text-lg font-bold text-[#141936] mt-0.5 tabular-nums">5 Days</div>
              </div>
              <div className="card-elevated rounded-2xl p-4">
                <div className="text-[11px] font-semibold text-[#81879C]">Students Seated</div>
                <div className="text-lg font-bold text-[#141936] mt-0.5 tabular-nums">142 Enrolled</div>
              </div>
              <div className="card-elevated rounded-2xl p-4">
                <div className="text-[11px] font-semibold text-[#81879C]">Digital Verification</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">Confirmed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
