import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  Copy,
  Download,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';

export function AIAssistantView() {
  const {
    courses,
    chatSessions,
    activeSessionId,
    setActiveSessionId,
    createChatSession,
    appendChatMessage,
    clearCurrentSessionMessages,
    showToast,
  } = useWorkspace();

  const activeSession =
    chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];

  const [courseScope, setCourseScope] = useState<string[]>(
    activeSession?.courseScopeJson || ['CS301', 'MATH240', 'BIO110', 'ENG205']
  );
  const [deepReasoning, setDeepReasoning] = useState<boolean>(
    activeSession?.deepReasoning ?? true
  );
  const [promptInput, setPromptInput] = useState('');
  const [sending, setSending] = useState(false);

  const toggleCourseScope = (code: string) => {
    setCourseScope((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSend = async (textOverride?: string) => {
    const content = (textOverride ?? promptInput).trim();
    if (!content || sending || !activeSession) return;
    if (!textOverride) setPromptInput('');

    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await appendChatMessage(activeSession.id, {
      role: 'user',
      badgeLabel: 'Student',
      timeLabel,
      content,
    });

    try {
      setSending(true);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: activeSession.messages,
          courseScope,
          deepReasoning,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Copilot response failed');

      await appendChatMessage(activeSession.id, {
        role: 'assistant',
        badgeLabel: deepReasoning ? 'Deep Reasoning Breakdown' : 'Course Synthesizer',
        timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: data.content,
        codeSnippet: data.codeSnippet,
        gotchaTip: data.gotchaTip,
      });
    } catch (err: any) {
      showToast(err.message || 'Failed contacting EduTrack Copilot');
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
    link.download = `edutrack_copilot_session_${activeSession.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported Copilot transcript');
  };

  return (
    <div className="space-y-5">
      {/* Top Copilot Header */}
      <div className="card-elevated rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B67E8] to-[#414CCE] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#141936]">
              EduTrack AI Copilot &amp; Academic Assistant
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] font-semibold">
                Academic Reasoning Engine
              </span>
              <span className="text-[#454654]">
                Context Active: Spring 2025 Enrolled Courses ({courseScope.length} syllabi)
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => activeSession && clearCurrentSessionMessages(activeSession.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8FC] text-xs font-semibold text-[#454654] hover:text-[#141936]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Chat
          </button>
          <button
            onClick={handleExportTranscript}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC]"
          >
            <Download className="w-3.5 h-3.5" />
            Export Transcript
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
            Deep Reasoning
          </button>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Context Rail (4 cols on lg, 3 on xl) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Active Scope */}
          <div className="card-elevated rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#141936]">Active Scope</span>
              <span className="px-2 py-0.5 rounded bg-[#EEF3FF] text-[#414CCE] text-[10px] font-bold">
                {courseScope.length} OF 4
              </span>
            </div>
            <p className="text-[11px] text-[#81879C]">
              Select course resources to ground code execution, citations, and formulas:
            </p>
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
                    <div>
                      <div className="text-xs font-bold text-[#141936]">{c.code}</div>
                      <div className="text-[11px] text-[#81879C]">{c.name}</div>
                    </div>
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center ${
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

          {/* Curated Prompts */}
          <div className="card-elevated rounded-2xl p-4 space-y-2.5">
            <div className="text-xs font-bold text-[#141936]">Curated Prompts</div>
            {[
              'Explain Raft leader election split-brain edge cases',
              'Generate 5 practice exam questions for MATH240 Eigenvalues',
              'Review CS301 code test cases for consensus timeouts',
              'Synthesize BIO110 Enzyme Kinetics paper',
              'Build 3-hour Pomodoro study schedule for tonight',
            ].map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                className="w-full text-left p-2.5 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-xs font-medium text-[#141936] transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Past Sessions */}
          <div className="card-elevated rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.06em] text-[#81879C] uppercase">
                PAST SESSIONS
              </span>
              <button
                onClick={() => createChatSession('New Academic Session', courseScope, deepReasoning)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#414CCE] hover:underline"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
            </div>
            <div className="space-y-1.5">
              {chatSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors ${
                    s.id === activeSession?.id
                      ? 'bg-[#EEF3FF] text-[#414CCE] font-bold'
                      : 'text-[#454654] hover:bg-[#F7F8FC]'
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    {s.title}
                  </span>
                  <span className="text-[10px] text-[#81879C] shrink-0">{s.dateLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Knowledge Sync */}
          <div className="card-elevated rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#141936]">Knowledge Sync</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Live
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#454654]">
              <span>4 Course PDFs &amp; Slides</span>
              <span className="font-bold text-[#414CCE]">100% Vectorized</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-[#414CCE] w-full rounded-full" />
            </div>
            <button
              onClick={() => showToast('Synchronized Campus Canvas LMS materials')}
              className="w-full py-2 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-xs font-semibold text-[#141936] flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#414CCE]" />
              Sync Campus Canvas LMS
            </button>
          </div>
        </div>

        {/* Right Chat Stream (8 cols on lg, 9 on xl) */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
          <div className="card-elevated rounded-2xl p-5 sm:p-6 space-y-6 min-h-[540px]">
            {activeSession?.messages.length === 0 && (
              <div className="py-16 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-[#414CCE] mx-auto" />
                <div className="text-sm font-bold text-[#141936]">Start a New Academic Deep Dive</div>
                <p className="text-xs text-[#81879C] max-w-md mx-auto">
                  Select a curated prompt on the left or ask any question below grounded in your enrolled
                  courses.
                </p>
              </div>
            )}

            {activeSession?.messages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="text-[11px] text-[#81879C] mb-1.5">
                      {msg.timeLabel} · <strong className="text-[#141936]">Alex Vance</strong> · Student
                    </div>
                    <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-[#414CCE] text-white px-5 py-3.5 text-sm leading-relaxed shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-[#141936]">EduTrack Copilot</span>
                      {msg.badgeLabel && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[11px] font-semibold">
                          {msg.badgeLabel}
                        </span>
                      )}
                      <span className="text-[#81879C]">{msg.timeLabel}</span>
                    </div>

                    <div className="rounded-2xl bg-[#F7F8FC] border border-slate-200/70 p-4 sm:p-5 space-y-4 text-sm text-[#141936] leading-relaxed whitespace-pre-wrap">
                      {msg.content}

                      {/* Embedded State Machine Quorum Flow on the seeded Deep Reasoning message */}
                      {msg.id === 3 && (
                        <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-[#81879C] uppercase tracking-wider">
                              STATE MACHINE QUORUM FLOW (3-NODE CLUSTER)
                            </span>
                            <span className="text-[#414CCE]">T_election: Node A (162ms) &lt; Node B (240ms)</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                            <div className="p-3 rounded-xl bg-[#EEF3FF] border border-indigo-200">
                              <div className="text-xs font-bold text-[#141936]">Node A (Cand.)</div>
                              <div className="text-[11px] text-[#414CCE] font-mono mt-0.5">Timer: 162ms</div>
                              <div className="mt-2 inline-block px-2 py-0.5 rounded bg-[#414CCE] text-white text-[10px] font-bold">
                                TIMES OUT FIRST
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-[#F7F8FC] border border-slate-200">
                              <div className="text-xs font-bold text-[#141936]">Node B (Follower)</div>
                              <div className="text-[11px] text-[#454654] font-mono mt-0.5">Timer: 240ms</div>
                              <div className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                VOTE GRANTED ✓
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-[#414CCE] text-white">
                              <div className="text-xs font-bold">Node A: LEADER</div>
                              <div className="text-[11px] text-indigo-100 font-mono mt-0.5">Term: T + 1</div>
                              <div className="mt-2 inline-block px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold">
                                Heartbeats Active
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Code Snippet */}
                      {msg.codeSnippet && (
                        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#141936] text-slate-100">
                          <div className="px-4 py-2 bg-[#1E2448] flex items-center justify-between text-xs">
                            <span className="font-mono text-indigo-200">Idiomatic Implementation</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(msg.codeSnippet || '');
                                showToast('Copied code snippet');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold"
                            >
                              <Copy className="w-3 h-3" />
                              Copy Code
                            </button>
                          </div>
                          <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                            <code>{msg.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Gotcha Callout */}
                      {msg.gotchaTip && (
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{msg.gotchaTip}</span>
                        </div>
                      )}
                    </div>

                    {msg.codeSnippet && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleSend('Generate Go unit test cases for resetElectionTimer()')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:border-[#414CCE]"
                        >
                          &lt;/&gt; Generate Go Unit Test Cases
                        </button>
                        <button
                          onClick={() => handleSend('Explain Step 2 symmetry breaking math further')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:border-[#414CCE]"
                        >
                          Explain Step 2 Further
                        </button>
                        <button
                          onClick={() => showToast('Added breakdown to My Study Notes')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-emerald-700 hover:border-emerald-400"
                        >
                          <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                          Add to My Study Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-[#414CCE] font-semibold">
                <Sparkles className="w-4 h-4 animate-spin" />
                EduTrack Copilot is reasoning across {courseScope.join(', ')}...
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="card-elevated rounded-2xl p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#81879C]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] font-semibold">
                  {deepReasoning ? 'Academic Deep Dive Mode' : 'Quick Concise Mode'}
                </span>
                <span>Grounding: Lecture Notes + Canvas Docs</span>
              </div>
              <span>Markdown &amp; LaTeX • Ctrl+Enter to send</span>
            </div>

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
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything about your courses, code, proofs, or upcoming exams (Markdown & LaTeX supported)..."
                className="flex-1 p-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={sending || !promptInput.trim()}
                className="h-11 px-5 rounded-xl bg-[#414CCE] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#3540B8] disabled:opacity-50 shrink-0"
              >
                Send
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
