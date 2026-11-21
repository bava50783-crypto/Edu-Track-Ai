import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Database,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';

export function SettingsView() {
  const {
    user,
    dbSynced,
    syncing,
    signInWithGoogle,
    logout,
    refreshWorkspace,
    customers,
    customerResponses,
    chatSessions,
    showToast,
  } = useWorkspace();

  const [agentName, setAgentName] = useState(user?.displayName || 'Dr. Clara Vance');
  const [defaultChannel, setDefaultChannel] = useState<'Support Portal' | 'Email' | 'Live Chat'>(
    'Support Portal'
  );
  const [notifyPending, setNotifyPending] = useState(true);
  const [notifyAiDrafts, setNotifyAiDrafts] = useState(true);
  const [autoContext, setAutoContext] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) {
      showToast('Agent display name cannot be empty', 'error');
      return;
    }
    setSavedNotice('Workspace and notification preferences updated.');
    showToast('Settings saved');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#414CCE]">
          <span>WORKSPACE CONFIGURATION</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#141936] mt-0.5">Settings</h1>
        <p className="text-sm text-[#454654] mt-0.5">
          Manage your Google authentication, PostgreSQL database synchronization, and AI assistant
          preferences.
        </p>
      </div>

      {savedNotice && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Account & PostgreSQL Sync */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-elevated rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#141936] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#414CCE]" />
              Account &amp; Authentication
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                user ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {user ? 'Authenticated' : 'Guest Preview'}
            </span>
          </div>

          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8FC]">
                <img
                  src={user.photoURL || '/src/assets/images/avatar_clara_vance_1795064440335.jpg'}
                  alt={user.displayName || 'User'}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-indigo-200"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#141936] truncate">
                    {user.displayName || 'Workspace User'}
                  </div>
                  <div className="text-xs text-[#454654] truncate">{user.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full py-2.5 rounded-xl bg-[#FFF5F5] text-[#BA1A1A] text-xs font-bold hover:bg-[#FFE9E9] inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#454654] leading-relaxed">
                Sign in with Google to persist customers, customer responses, and Gemini chat
                sessions directly to your Cloud SQL PostgreSQL database.
              </p>
              <button
                onClick={signInWithGoogle}
                className="w-full py-2.5 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8]"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>

        <div className="card-elevated rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#141936] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#414CCE]" />
              PostgreSQL Data Sync
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                dbSynced ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#454654]'
              }`}
            >
              {dbSynced ? 'Live Connected' : 'Local State'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-[#F7F8FC]">
              <div className="text-lg font-extrabold text-[#141936] tabular-nums">
                {customers.length}
              </div>
              <div className="text-[10px] font-semibold text-[#81879C]">Customers</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FC]">
              <div className="text-lg font-extrabold text-[#141936] tabular-nums">
                {customerResponses.length}
              </div>
              <div className="text-[10px] font-semibold text-[#81879C]">Responses</div>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FC]">
              <div className="text-lg font-extrabold text-[#141936] tabular-nums">
                {chatSessions.length}
              </div>
              <div className="text-[10px] font-semibold text-[#81879C]">Chat Sessions</div>
            </div>
          </div>

          <button
            onClick={refreshWorkspace}
            disabled={!user || syncing}
            className="w-full py-2.5 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-bold hover:bg-[#E0E7FF] disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronizing...' : 'Refresh Workspace from PostgreSQL'}
          </button>
        </div>
      </div>

      {/* Preferences Form */}
      <form onSubmit={handleSavePreferences} className="card-elevated rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#414CCE]" />
          <h2 className="text-sm font-bold text-[#141936]">
            Response Workflow &amp; AI Chatbot Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">
              Default Agent Display Name
            </label>
            <input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#454654] mb-1">
              Default Customer Intake Channel
            </label>
            <select
              value={defaultChannel}
              onChange={(e) =>
                setDefaultChannel(e.target.value as 'Support Portal' | 'Email' | 'Live Chat')
              }
              className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm"
            >
              <option value="Support Portal">Support Portal</option>
              <option value="Email">Email</option>
              <option value="Live Chat">Live Chat</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {[
            {
              label: 'Highlight pending customer responses in navigation badges',
              checked: notifyPending,
              onChange: () => setNotifyPending((v) => !v),
            },
            {
              label: 'Enable one-click Gemini response drafting in Customer Responses',
              checked: notifyAiDrafts,
              onChange: () => setNotifyAiDrafts((v) => !v),
            },
            {
              label: 'Preserve multi-turn conversation history in Chatbot sessions',
              checked: autoContext,
              onChange: () => setAutoContext((v) => !v),
            },
          ].map((item) => (
            <label
              key={item.label}
              className="flex items-center justify-between p-3 rounded-xl bg-[#F7F8FC] cursor-pointer"
            >
              <span className="text-xs font-medium text-[#141936]">{item.label}</span>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={item.onChange}
                className="w-4 h-4 accent-[#414CCE]"
              />
            </label>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-[#454654]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Gemini API credentials are strictly enforced server-side.</span>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
