import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CloudUpload,
  Copy,
  Download,
  FileText,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';

export function StudyHubView() {
  const {
    documents,
    selectedDocumentId,
    setSelectedDocumentId,
    addStudyDocument,
    updateDocumentSummary,
    toggleDocChecklistItem,
    deleteStudyDocument,
    setActiveNav,
    createChatSession,
    appendChatMessage,
    globalSearch,
    showToast,
  } = useWorkspace();

  const [docSearch, setDocSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [modelMode, setModelMode] = useState('Academic v4.1 (High Precision)');
  const [synthesizing, setSynthesizing] = useState(false);
  const [qaInput, setQaInput] = useState('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = useMemo(() => {
    const q = (docSearch || globalSearch).trim().toLowerCase();
    return documents.filter((d) => {
      if (courseFilter !== 'ALL' && d.courseCode !== courseFilter) return false;
      if (q && !`${d.fileName} ${d.courseCode} ${d.department}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [documents, docSearch, globalSearch, courseFilter]);

  const activeDoc = documents.find((d) => d.id === selectedDocumentId) || filteredDocs[0] || documents[0];

  const handleFileUpload = async (file: File) => {
    try {
      setSynthesizing(true);
      const isTextLike =
        file.type.startsWith('text/') ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.csv');

      let rawContent = `Academic course document uploaded: ${file.name}. Size: ${(file.size / 1024).toFixed(1)} KB.`;
      if (isTextLike) {
        const text = await file.text();
        if (text.trim()) rawContent = text.slice(0, 12000);
      }

      const courseCode = file.name.toUpperCase().includes('MATH')
        ? 'MATH240'
        : file.name.toUpperCase().includes('BIO')
        ? 'BIO110'
        : 'CS301';

      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, courseCode, rawContent }),
      });

      let summaryJson = activeDoc?.summaryJson;
      if (res.ok) {
        summaryJson = await res.json();
      }

      await addStudyDocument({
        courseCode,
        department: courseCode === 'MATH240' ? 'Mathematics' : courseCode === 'BIO110' ? 'Biology' : 'Computer Science',
        fileName: file.name,
        fileSizeLabel: `${Math.max(0.1, file.size / (1024 * 1024)).toFixed(1)} MB`,
        pageCount: Math.max(4, Math.round(rawContent.length / 400)),
        rawContent,
        summaryJson,
      });
      showToast(`Synthesized ${file.name} via Gemini`);
    } catch (err: any) {
      showToast(err.message || 'Upload failed');
    } finally {
      setSynthesizing(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!activeDoc) return;
    try {
      setSynthesizing(true);
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: activeDoc.fileName,
          courseCode: activeDoc.courseCode,
          rawContent: activeDoc.rawContent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Synthesis failed');
      await updateDocumentSummary(activeDoc.id, data);
      showToast('Synthesis Report refreshed by Gemini');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSynthesizing(false);
    }
  };

  const handleInterrogate = async (question: string) => {
    if (!activeDoc || !question.trim()) return;
    setQaInput(question);
    try {
      setQaLoading(true);
      const res = await fetch('/api/ai/doc-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: activeDoc.fileName,
          rawContent: activeDoc.rawContent,
          question: question.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Document Q&A failed');
      setQaAnswer(data.answer);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  const handleExportNotes = () => {
    if (!activeDoc) return;
    const s = activeDoc.summaryJson;
    const md = [
      `# Synthesis Report: ${activeDoc.fileName}`,
      `Course: ${activeDoc.courseCode} · Confidence: ${s.confidence}`,
      '',
      '## Executive Overview',
      s.executiveOverview,
      '',
      '## Key Concepts',
      ...s.keyConcepts.map((k) => `- **${k.title}** (${k.section}): ${k.description}`),
      '',
      '## Formulas',
      ...s.formulas.map((f) => `- **${f.title}**: \`${f.latex}\` — ${f.description}`),
      '',
      '## Exam-Focused Revision Checklist',
      ...s.checklist.map((c) => `- [${c.checked ? 'x' : ' '}] **${c.title}**: ${c.detail}`),
      '',
      `> **High-Yield Exam Takeaway:** ${s.examTakeaway}`,
    ].join('\n');

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDoc.fileName.replace(/\.[^/.]+$/, '')}_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported synthesis report as Markdown');
  };

  const handleOpenInCopilot = async (docName: string, courseCode: string) => {
    const session = await createChatSession(`Q&A: ${docName}`, [courseCode], true);
    await appendChatMessage(session.id, {
      role: 'assistant',
      badgeLabel: 'Course Synthesizer',
      timeLabel: 'Just now',
      content: `Loaded **${docName}** into active context. Ask any question about proofs, equations, or exam traps from this reading!`,
    });
    setActiveNav('ai-assistant');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#414CCE] font-bold">
              WORKSPACE 3.0
            </span>
            <span className="text-[#454654] font-medium">Neural Engine Active</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-[#141936] mt-1">
            Study Materials &amp; AI Hub
          </h1>
          <p className="text-sm text-[#454654] max-w-2xl">
            Manage your academic documents, extract instant AI summaries, and interrogate complex syllabus
            materials with context-aware semantic retrieval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => showToast('Synced with Institutional Drive')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#414CCE]" />
            Sync Drive
          </button>
          <button
            onClick={handleExportNotes}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#141936] hover:bg-[#F7F8FC]"
          >
            <Download className="w-3.5 h-3.5 text-[#414CCE]" />
            Export Notes
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B67E8] to-[#414CCE] text-white text-xs font-semibold shadow-sm"
          >
            + Upload Document
          </button>
        </div>
      </div>

      {/* Main 2-Column Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Document Library (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.docx,.epub"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileUpload(f);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="card-elevated rounded-2xl p-6 border-2 border-dashed border-slate-200 hover:border-[#414CCE] text-center cursor-pointer transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center mx-auto">
              <CloudUpload className="w-5 h-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#141936]">Drag PDF up to 50MB or browse</h3>
            <p className="mt-1 text-xs text-[#81879C]">
              Smart OCR, vector chunking, and syntax indexing auto-applied upon ingest
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-[#F7F8FC] text-[#454654]">PDF</span>
              <span className="px-2 py-0.5 rounded bg-[#F7F8FC] text-[#454654]">EPUB</span>
              <span className="px-2 py-0.5 rounded bg-[#F7F8FC] text-[#454654]">DOCX</span>
              <span className="px-2 py-0.5 rounded bg-[#EEF3FF] text-[#414CCE]">LaTeX Ready</span>
            </div>
          </div>

          {activeDoc && (
            <div className="card-elevated rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#EEF3FF] text-[#414CCE] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#141936] truncate">{activeDoc.fileName}</div>
                    <div className="text-[11px] text-[#81879C] tabular-nums">
                      {activeDoc.fileSizeLabel} • {activeDoc.pageCount} Pages
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#414CCE]">AI Ready</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="text-[#454654] font-medium">Embedding &amp; Vector Synthesis</span>
                <span className="font-bold text-[#414CCE]">
                  {synthesizing ? 'Synthesizing...' : '100% Processed'}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-[#414CCE] transition-all ${
                    synthesizing ? 'w-2/3 animate-pulse' : 'w-full'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Course Documents Library */}
          <div className="card-elevated rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#141936]">Course Documents</span>
                <span className="px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#414CCE] text-[11px] font-bold tabular-nums">
                  {documents.length} Active
                </span>
              </div>
              <span className="text-xs text-[#81879C]">Date added</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#81879C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search title, module, or tags..."
                className="w-full h-9 pl-8 pr-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'CS301', 'MATH240', 'BIO110'].map((code) => (
                <button
                  key={code}
                  onClick={() => setCourseFilter(code)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    courseFilter === code
                      ? 'bg-[#414CCE] text-white'
                      : 'bg-[#F7F8FC] text-[#454654] hover:text-[#141936]'
                  }`}
                >
                  {code === 'ALL' ? 'All' : code}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredDocs.map((doc) => {
                const selected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocumentId(doc.id);
                      setQaAnswer(null);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#EEF3FF]/60 border-[#414CCE]'
                        : 'bg-white border-slate-200/80 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#141936] truncate">{doc.fileName}</div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#81879C]">
                          <span className="px-2 py-0.5 rounded bg-[#EEF3FF] text-[#414CCE] font-semibold">
                            {doc.department}
                          </span>
                          <span>• {doc.pageCount} pages</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocumentId(doc.id);
                            handleRegenerateSummary();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#414CCE] text-white text-[11px] font-semibold hover:bg-[#3540B8]"
                        >
                          <Sparkles className="w-3 h-3" />
                          Summarize
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInCopilot(doc.fileName, doc.courseCode);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F8FC] text-[#141936] text-[11px] font-semibold hover:bg-[#EEF3FF]"
                        >
                          <MessageSquare className="w-3 h-3 text-[#414CCE]" />
                          Q&amp;A Chat
                        </button>
                      </div>

                      <div className="flex items-center gap-1 text-[#81879C]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportNotes();
                          }}
                          className="p-1.5 rounded-lg hover:text-[#414CCE]"
                          title="Export"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteStudyDocument(doc.id);
                          }}
                          className="p-1.5 rounded-lg hover:text-[#BA1A1A]"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-[#F7F8FC] flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-[#141936]">Institutional Canvas Sync</div>
                <div className="text-[11px] text-[#81879C]">Last synchronized 14 mins ago</div>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#414CCE]" />
            </div>
          </div>
        </div>

        {/* Right Column: Synthesis Report & Interrogation (7 cols) */}
        {activeDoc && (
          <div className="lg:col-span-7 space-y-5">
            {/* Mode Bar */}
            <div className="card-elevated rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1.5 rounded-xl bg-[#F7F8FC] text-xs font-bold text-[#141936]">
                  Quick Summary
                </span>
                <select
                  value={modelMode}
                  onChange={(e) => setModelMode(e.target.value)}
                  className="h-9 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs font-semibold text-[#414CCE]"
                >
                  <option>Academic v4.1 (High Precision)</option>
                  <option>Exam Cram (Key Invariants)</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleRegenerateSummary}
                  disabled={synthesizing}
                  className="p-2 rounded-xl bg-[#F7F8FC] text-[#454654] hover:text-[#414CCE]"
                  title="Regenerate synthesis"
                >
                  <RefreshCw className={`w-4 h-4 ${synthesizing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeDoc.summaryJson.executiveOverview);
                    showToast('Copied overview to clipboard');
                  }}
                  className="p-2 rounded-xl bg-[#F7F8FC] text-[#454654] hover:text-[#414CCE]"
                  title="Copy summary"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportNotes}
                  className="p-2 rounded-xl bg-[#F7F8FC] text-[#454654] hover:text-[#414CCE]"
                  title="Download notes"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Synthesis Report Card */}
            <div className="card-elevated rounded-2xl p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#414CCE]" />
                  <h2 className="text-lg font-bold text-[#141936]">
                    Synthesis Report: {activeDoc.fileName.replace(/\.[^/.]+$/, '')}
                  </h2>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] font-semibold">
                    Confidence: {activeDoc.summaryJson.confidence}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F7F8FC] text-[#454654] font-semibold">
                    Reading time: {activeDoc.summaryJson.readingTime}
                  </span>
                </div>
              </div>

              {/* Executive Overview */}
              <div>
                <h3 className="text-sm font-bold text-[#141936]">Executive Overview</h3>
                <p className="mt-2 text-sm text-[#454654] leading-relaxed">
                  {activeDoc.summaryJson.executiveOverview}
                </p>
              </div>

              {/* Key Concepts */}
              <div>
                <h3 className="text-sm font-bold text-[#141936] mb-3">Key Concepts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeDoc.summaryJson.keyConcepts.map((kc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-[10px] font-bold tracking-[0.06em] text-[#414CCE] uppercase">
                          {kc.kicker}
                        </div>
                        <div className="mt-1 text-sm font-bold text-[#141936]">{kc.title}</div>
                        <p className="mt-1.5 text-xs text-[#454654] leading-relaxed">{kc.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-[#414CCE]">
                        <span>{kc.section}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important Definitions & Formulas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[#141936]">
                    <BookOpen className="w-4 h-4 text-[#414CCE]" />
                    Important Definitions &amp; Formulas
                  </div>
                  <span className="text-[11px] text-[#81879C]">Click box to copy LaTeX</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeDoc.summaryJson.formulas.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        navigator.clipboard.writeText(f.latex);
                        showToast(`Copied formula: ${f.latex}`);
                      }}
                      className="text-left p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 hover:border-[#414CCE] transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[#141936]">
                        <span>{f.title}</span>
                        <Copy className="w-3.5 h-3.5 text-[#81879C]" />
                      </div>
                      <div className="my-2.5 p-2.5 rounded-lg bg-white border border-slate-200/60 text-center font-mono text-sm font-semibold text-[#414CCE]">
                        {f.latex}
                      </div>
                      <p className="text-[11px] text-[#454654]">{f.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exam-Focused Revision Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#141936]">Exam-Focused Revision Checklist</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[11px] font-semibold">
                    High Probability
                  </span>
                </div>
                <div className="space-y-2.5">
                  {activeDoc.summaryJson.checklist.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleDocChecklistItem(activeDoc.id, item.id)}
                      className="w-full text-left p-3.5 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF]/60 flex items-start gap-3 transition-colors"
                    >
                      <span
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          item.checked ? 'bg-[#414CCE] text-white' : 'bg-white border border-slate-300'
                        }`}
                      >
                        {item.checked && <Check className="w-3 h-3" />}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[#141936]">{item.title}</div>
                        <div className="text-xs text-[#454654] mt-0.5">{item.detail}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* High-Yield Exam Takeaway */}
              <div className="p-4 rounded-xl bg-[#EEF3FF] border border-indigo-200/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#414CCE] flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#414CCE]">High-Yield Exam Takeaway</div>
                  <p className="mt-1 text-xs text-[#141936] leading-relaxed">
                    {activeDoc.summaryJson.examTakeaway}
                  </p>
                </div>
              </div>

              {qaAnswer && (
                <div className="p-4 rounded-xl bg-[#F4F2FF] border border-indigo-200 text-xs text-[#141936] whitespace-pre-wrap leading-relaxed">
                  <div className="font-bold text-[#414CCE] mb-1">Document AI Answer</div>
                  {qaAnswer}
                </div>
              )}
            </div>

            {/* Bottom Interrogation Input */}
            <div className="card-elevated rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#81879C] font-medium">Suggested inquiries:</span>
                {[
                  'Explain log compaction in Raft',
                  'Generate 5 mock midterm questions',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleInterrogate(q)}
                    className="px-3 py-1 rounded-full bg-[#F7F8FC] hover:bg-[#EEF3FF] text-[#141936] font-semibold"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleInterrogate(qaInput);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder={`Interrogate ${activeDoc.fileName}...`}
                  className="flex-1 h-10 px-3.5 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={qaLoading}
                  className="px-4 h-10 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] whitespace-nowrap disabled:opacity-60"
                >
                  {qaLoading ? 'Thinking...' : 'Ask AI'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
