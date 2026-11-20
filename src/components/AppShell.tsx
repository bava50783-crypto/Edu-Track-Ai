import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { useWorkspace, type NavTab } from '../context/WorkspaceContext.tsx';
import { NewAssignmentModal, SettingsModal } from './Modals.tsx';

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'study-hub', label: 'Study Hub', icon: BookOpen },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'faculty', label: 'Faculty View', icon: GraduationCap },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    activeNav,
    setActiveNav,
    globalSearch,
    setGlobalSearch,
    user,
    dbSynced,
    signInWithGoogle,
    logout,
    announcements,
    toastMessage,
  } = useWorkspace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newAssignOpen, setNewAssignOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen flex bg-[#F7F8FC] text-[#141936]">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:w-[248px] lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200/80 z-30">
        <div className="px-5 pt-5 pb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#414CCE] to-[#5C4BC3] flex items-center justify-center text-white font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight text-[#141936]">
              EduTrack <span className="text-[#414CCE]">AI</span>
            </div>
            <div className="text-[11px] font-medium text-[#81879C]">Academic OS</div>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2">
          <div className="text-[10px] font-bold tracking-[0.08em] text-[#81879C] uppercase">
            MAIN NAVIGATION
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 h-11 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white shadow-[0_6px_16px_rgba(65,76,206,0.24)]'
                    : 'text-[#454654] hover:bg-[#F7F8FC] hover:text-[#141936]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#81879C]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile Card */}
        <div className="p-3.5 mt-auto">
          <div className="rounded-2xl bg-[#F7F8FC] border border-slate-200/70 p-3.5">
            <div className="flex items-center gap-2.5">
              <img
                src={
                  user?.photoURL ||
                  (activeNav === 'faculty'
                    ? '/src/assets/images/avatar_aris_thorne_1795064440903.jpg'
                    : '/src/assets/images/avatar_clara_vance_1795064440335.jpg')
                }
                alt={user?.displayName || 'Dr. Clara Vance'}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-indigo-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#141936] truncate">
                  {user?.displayName || 'Dr. Clara Vance'}
                </div>
                <div className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[10px] font-semibold">
                  {activeNav === 'faculty' ? 'Faculty' : user ? 'Synced Account' : 'Faculty'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs font-semibold">
              <button
                onClick={() => setSettingsOpen(true)}
                className="inline-flex items-center gap-1.5 text-[#454654] hover:text-[#141936]"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
              {user ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1 text-[#BA1A1A] hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log out
                </button>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="inline-flex items-center gap-1 text-[#414CCE] hover:underline"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#141936]/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 bg-white h-full p-4 flex flex-col z-10 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-[#141936]">EduTrack AI</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-[#81879C]" />
              </button>
            </div>
            <nav className="mt-4 space-y-1 flex-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 h-11 rounded-xl text-sm font-semibold ${
                      active ? 'bg-[#414CCE] text-white' : 'text-[#454654]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 lg:pl-[248px] flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#454654] hover:bg-[#F7F8FC]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#81879C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search courses, students, topics, or resources..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 text-sm text-[#141936] placeholder:text-[#81879C] focus:bg-white focus:border-[#5B67E8] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#414CCE]" />
              Spring Term 2025
            </span>

            <button
              onClick={() => setNewAssignOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF] transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              New Assignment
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2.5 rounded-xl bg-[#F7F8FC] text-[#454654] hover:bg-[#EEF3FF] hover:text-[#414CCE] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#BA1A1A]" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-200 p-3 z-40">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#141936]">Recent Notices ({unreadCount} unread)</span>
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        setActiveNav('announcements');
                      }}
                      className="text-xs font-semibold text-[#414CCE]"
                    >
                      View all
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {announcements.slice(0, 3).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setNotifOpen(false);
                          setActiveNav('announcements');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#F7F8FC]"
                      >
                        <div className="text-xs font-semibold text-[#141936] line-clamp-1">{a.title}</div>
                        <div className="text-[11px] text-[#81879C] mt-0.5">{a.publishedLabel}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#EEF3FF] text-[#414CCE] text-xs font-semibold hover:bg-[#E0E7FF]"
                title={dbSynced ? 'Synced to Cloud SQL PostgreSQL' : 'Signed in'}
              >
                <img
                  src={user.photoURL || '/src/assets/images/avatar_alex_vance_1795064440676.jpg'}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover"
                />
                <UserCheck className="w-3.5 h-3.5 hidden sm:block" />
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#414CCE] text-white text-xs font-semibold hover:bg-[#3540B8] whitespace-nowrap"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 pb-20 lg:pb-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-30">
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold ${
                active ? 'text-[#414CCE]' : 'text-[#81879C]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#141936] text-white text-xs font-semibold shadow-xl">
          {toastMessage}
        </div>
      )}

      <NewAssignmentModal open={newAssignOpen} onClose={() => setNewAssignOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
