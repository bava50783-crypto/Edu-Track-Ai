import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Edit3,
  MessageSquarePlus,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import type { CustomerResponseItem } from '../data/initialData.ts';
import type { InteractionHistoryEntry } from '../db/schema.ts';

type StatusFilter = 'All' | 'Pending' | 'Responded' | 'Resolved';
type PriorityFilter = 'All' | 'High' | 'Medium' | 'Low';
type SortOption = 'newest' | 'oldest' | 'priority' | 'customer';

const PRIORITY_WEIGHT: Record<'High' | 'Medium' | 'Low', number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function formatTimestamp(iso: string | Date | null | undefined) {
  if (!iso) return '—';
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CustomerResponsesView() {
  const {
    customers,
    customerResponses,
    selectedResponseId,
    setSelectedResponseId,
    createCustomerResponse,
    updateCustomerResponse,
    deleteCustomerResponse,
    globalSearch,
    syncing,
  } = useWorkspace();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Inline feedback banner for actions
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add / Edit modal state
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formCustomerId, setFormCustomerId] = useState<number>(customers[0]?.id || 1);
  const [formSubject, setFormSubject] = useState('');
  const [formQueryText, setFormQueryText] = useState('');
  const [formResponseText, setFormResponseText] = useState('');
  const [formStatus, setFormStatus] = useState<'Pending' | 'Responded' | 'Resolved'>('Pending');
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formChannel, setFormChannel] = useState<'Support Portal' | 'Email' | 'Live Chat'>('Support Portal');
  const [formAgent, setFormAgent] = useState('Dr. Clara Vance');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Detail quick-reply & AI draft state
  const [draftReply, setDraftReply] = useState('');
  const [draftStatus, setDraftStatus] = useState<'Pending' | 'Responded' | 'Resolved'>('Responded');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const customerMap = useMemo(() => {
    const map = new Map<number, (typeof customers)[number]>();
    for (const c of customers) map.set(c.id, c);
    return map;
  }, [customers]);

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase();

  const filteredResponses = useMemo(() => {
    const list = customerResponses.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
      if (!combinedSearch) return true;
      const cust = customerMap.get(r.customerId);
      return (
        r.subject.toLowerCase().includes(combinedSearch) ||
        r.queryText.toLowerCase().includes(combinedSearch) ||
        r.responseText.toLowerCase().includes(combinedSearch) ||
        r.assignedAgent.toLowerCase().includes(combinedSearch) ||
        (cust?.name.toLowerCase().includes(combinedSearch) ?? false) ||
        (cust?.organization.toLowerCase().includes(combinedSearch) ?? false)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
      }
      if (sortBy === 'priority') {
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      const nameA = customerMap.get(a.customerId)?.name || '';
      const nameB = customerMap.get(b.customerId)?.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [customerResponses, statusFilter, priorityFilter, combinedSearch, sortBy, customerMap]);

  const selectedResponse =
    customerResponses.find((r) => r.id === selectedResponseId) ||
    filteredResponses[0] ||
    customerResponses[0] ||
    null;

  useEffect(() => {
    if (selectedResponse) {
      setDraftReply(selectedResponse.responseText || '');
      setDraftStatus(
        selectedResponse.status === 'Pending' ? 'Responded' : selectedResponse.status
      );
    }
  }, [selectedResponse?.id]);

  const totalCount = customerResponses.length;
  const pendingCount = customerResponses.filter((r) => r.status === 'Pending').length;
  const respondedCount = customerResponses.filter((r) => r.status === 'Responded').length;
  const resolvedCount = customerResponses.filter((r) => r.status === 'Resolved').length;

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormCustomerId(customers[0]?.id || 1);
    setFormSubject('');
    setFormQueryText('');
    setFormResponseText('');
    setFormStatus('Pending');
    setFormPriority('Medium');
    setFormChannel('Support Portal');
    setFormAgent('Dr. Clara Vance');
    setFormError(null);
  };

  const openEditModal = (item: CustomerResponseItem) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormCustomerId(item.customerId);
    setFormSubject(item.subject);
    setFormQueryText(item.queryText);
    setFormResponseText(item.responseText);
    setFormStatus(item.status);
    setFormPriority(item.priority);
    setFormChannel(item.channel);
    setFormAgent(item.assignedAgent);
    setFormError(null);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formCustomerId) {
      setFormError('Please select a customer.');
      return;
    }
    if (!formSubject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if (!formQueryText.trim()) {
      setFormError('Customer query cannot be empty.');
      return;
    }
    if ((formStatus === 'Responded' || formStatus === 'Resolved') && !formResponseText.trim()) {
      setFormError('Please enter a response message before marking as Responded or Resolved.');
      return;
    }

    try {
      setSaving(true);
      if (modalMode === 'create') {
        await createCustomerResponse({
          customerId: Number(formCustomerId),
          subject: formSubject.trim(),
          queryText: formQueryText.trim(),
          responseText: formResponseText.trim(),
          status: formStatus,
          priority: formPriority,
          channel: formChannel,
          assignedAgent: formAgent.trim() || 'Dr. Clara Vance',
        });
        setBanner({ type: 'success', text: `Created inquiry "${formSubject.trim()}" successfully.` });
      } else if (modalMode === 'edit' && editingId !== null) {
        const existing = customerResponses.find((r) => r.id === editingId);
        const nextHistory: InteractionHistoryEntry[] = [...(existing?.historyJson || [])];
        if (formResponseText.trim() && formResponseText.trim() !== existing?.responseText.trim()) {
          nextHistory.push({
            id: `h-${Date.now()}`,
            actor: formAgent.trim() || 'Dr. Clara Vance',
            role: 'agent',
            message: formResponseText.trim(),
            timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          });
        }
        await updateCustomerResponse(editingId, {
          subject: formSubject.trim(),
          queryText: formQueryText.trim(),
          responseText: formResponseText.trim(),
          status: formStatus,
          priority: formPriority,
          channel: formChannel,
          assignedAgent: formAgent.trim() || 'Dr. Clara Vance',
          historyJson: nextHistory,
        });
        setBanner({ type: 'success', text: `Updated response "${formSubject.trim()}" successfully.` });
      }
      setModalMode(null);
    } catch (err: any) {
      setFormError(err.message || 'Unable to save customer response.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetailReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResponse) return;
    if (!draftReply.trim()) {
      setBanner({ type: 'error', text: 'Please enter a response before saving.' });
      return;
    }

    const nextHistory: InteractionHistoryEntry[] = [
      ...(selectedResponse.historyJson || []),
      {
        id: `h-${Date.now()}`,
        actor: selectedResponse.assignedAgent || 'Dr. Clara Vance',
        role: 'agent',
        message: draftReply.trim(),
        timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      },
    ];

    try {
      setSaving(true);
      await updateCustomerResponse(selectedResponse.id, {
        responseText: draftReply.trim(),
        status: draftStatus,
        historyJson: nextHistory,
      });
      setBanner({
        type: 'success',
        text: `Response saved and ticket marked as ${draftStatus}.`,
      });
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed updating customer response.' });
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatus = async (status: 'Pending' | 'Responded' | 'Resolved') => {
    if (!selectedResponse) return;
    try {
      await updateCustomerResponse(selectedResponse.id, { status });
      setBanner({ type: 'success', text: `Status updated to ${status}.` });
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed updating status.' });
    }
  };

  const handleDraftWithGemini = async () => {
    if (!selectedResponse) return;
    const cust = customerMap.get(selectedResponse.customerId);
    try {
      setGeneratingDraft(true);
      setBanner(null);
      const res = await fetch('/api/ai/draft-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cust?.name || 'Customer',
          organization: cust?.organization || '',
          subject: selectedResponse.subject,
          queryText: selectedResponse.queryText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gemini draft generation failed');
      setDraftReply(data.draft || '');
      setBanner({ type: 'success', text: 'Draft generated with Gemini AI. Review and send.' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Unable to generate Gemini draft.' });
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      setSaving(true);
      await deleteCustomerResponse(id);
      setConfirmDeleteId(null);
      setBanner({ type: 'success', text: 'Customer response deleted.' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err.message || 'Failed deleting customer response.' });
    } finally {
      setSaving(false);
    }
  };

  const selectedCustomer = selectedResponse
    ? customerMap.get(selectedResponse.customerId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#414CCE]">
            <span>RESPONSE MANAGEMENT</span>
            <span className="text-[#81879C]">• {pendingCount} Pending Action</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141936] mt-0.5">
            Customer Responses
          </h1>
          <p className="text-sm text-[#454654] mt-0.5">
            Track inquiries, draft Gemini-assisted replies, manage resolution statuses, and audit
            interaction history.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] shadow-sm whitespace-nowrap"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Customer Response
        </button>
      </div>

      {/* Inline Success/Error Feedback Banner */}
      {banner && (
        <div
          className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold ${
            banner.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-[#FFE9E9] border border-red-200 text-[#BA1A1A]'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)} className="p-1 rounded-lg hover:bg-black/5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Status Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
            All Inquiries
          </div>
          <div className="text-2xl font-extrabold text-[#141936] tabular-nums mt-1">{totalCount}</div>
          <div className="text-xs text-[#454654] mt-1">Across all support channels</div>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Pending
          </div>
          <div className="text-2xl font-extrabold text-amber-700 tabular-nums mt-1">
            {pendingCount}
          </div>
          <div className="text-xs text-[#454654] mt-1">Awaiting initial reply</div>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#414CCE]">
            Responded
          </div>
          <div className="text-2xl font-extrabold text-[#414CCE] tabular-nums mt-1">
            {respondedCount}
          </div>
          <div className="text-xs text-[#454654] mt-1">Active follow-up</div>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Resolved
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
            {resolvedCount}
          </div>
          <div className="text-xs text-[#454654] mt-1">Closed with confirmation</div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="card-elevated rounded-2xl p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Pending', 'Responded', 'Resolved'] as StatusFilter[]).map((st) => {
            const active = statusFilter === st;
            const count =
              st === 'All'
                ? totalCount
                : st === 'Pending'
                ? pendingCount
                : st === 'Responded'
                ? respondedCount
                : resolvedCount;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#414CCE] text-white'
                    : 'bg-[#F7F8FC] text-[#454654] hover:bg-[#EEF3FF] hover:text-[#141936]'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 flex-1 xl:justify-end">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-[#81879C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search customer, subject, query..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="h-9 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs font-semibold text-[#141936]"
            aria-label="Filter by priority"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <div className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#81879C]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-semibold text-[#141936] focus:outline-none"
              aria-label="Sort customer responses"
            >
              <option value="newest">Sort: Newest Updated</option>
              <option value="oldest">Sort: Oldest Updated</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="customer">Sort: Customer A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Queue + Detail Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Queue */}
        <div className="lg:col-span-5 space-y-3">
          {syncing && customerResponses.length === 0 ? (
            <div className="card-elevated rounded-2xl p-10 text-center text-xs text-[#81879C]">
              Loading customer responses...
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="card-elevated rounded-2xl p-10 text-center space-y-3">
              <MessageSquareText className="w-10 h-10 text-[#81879C] mx-auto" />
              <div className="text-sm font-bold text-[#141936]">No customer responses found</div>
              <p className="text-xs text-[#81879C]">
                Adjust your search or status filter, or create a new customer response entry.
              </p>
              <button
                onClick={() => {
                  setLocalSearch('');
                  setStatusFilter('All');
                  setPriorityFilter('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredResponses.map((item) => {
              const cust = customerMap.get(item.customerId);
              const selected = selectedResponse?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedResponseId(item.id)}
                  className={`card-elevated rounded-2xl p-4 cursor-pointer transition-all space-y-2.5 ${
                    selected ? 'ring-2 ring-[#414CCE] bg-[#EEF3FF]/20' : 'hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Responded'
                            ? 'bg-[#EEF3FF] text-[#414CCE]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-[#FFE9E9] text-[#BA1A1A]'
                            : item.priority === 'Medium'
                            ? 'bg-slate-100 text-[#454654]'
                            : 'bg-slate-50 text-[#81879C]'
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-[10px] font-semibold text-[#81879C]">
                        {item.channel}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#81879C] tabular-nums shrink-0">
                      {formatTimestamp(item.updatedAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#141936] line-clamp-1">{item.subject}</h3>
                    <div className="text-xs font-semibold text-[#414CCE] mt-0.5">
                      {cust?.name || 'Customer'} •{' '}
                      <span className="text-[#81879C] font-normal">
                        {cust?.organization || 'Account'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#454654] line-clamp-2 leading-relaxed">
                    {item.queryText}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail, Interaction History & Reply Editor */}
        <div className="lg:col-span-7">
          {selectedResponse ? (
            <div className="card-elevated rounded-2xl p-5 sm:p-6 space-y-5">
              {/* Ticket Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        selectedResponse.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedResponse.status === 'Responded'
                          ? 'bg-[#EEF3FF] text-[#414CCE]'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedResponse.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F7F8FC] text-[#454654] text-[11px] font-semibold">
                      {selectedResponse.priority} Priority
                    </span>
                    <span className="text-xs text-[#81879C]">{selectedResponse.channel}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#141936]">{selectedResponse.subject}</h2>
                  <div className="text-xs text-[#454654] flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-[#141936]">
                      {selectedCustomer?.name || 'Customer'}
                    </span>
                    <span>{selectedCustomer?.email || ''}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#414CCE]" />
                      Assigned: {selectedResponse.assignedAgent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(selectedResponse)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-xs font-semibold text-[#141936]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(selectedResponse.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF5F5] hover:bg-[#FFE9E9] text-xs font-semibold text-[#BA1A1A]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Timestamps & Quick Status Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F7F8FC] rounded-xl px-4 py-2.5 text-[11px] text-[#454654]">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#81879C]" />
                    Created: {formatTimestamp(selectedResponse.createdAt)}
                  </span>
                  <span>Updated: {formatTimestamp(selectedResponse.updatedAt)}</span>
                  <span>Responded: {formatTimestamp(selectedResponse.respondedAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(['Pending', 'Responded', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleQuickStatus(st)}
                      disabled={selectedResponse.status === st}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        selectedResponse.status === st
                          ? 'bg-[#414CCE] text-white'
                          : 'bg-white border border-slate-200 text-[#454654] hover:border-[#414CCE]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Query */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
                  Original Customer Query
                </div>
                <div className="p-4 rounded-xl bg-[#F7F8FC] border border-slate-200/70 text-sm text-[#141936] leading-relaxed">
                  {selectedResponse.queryText}
                </div>
              </div>

              {/* Interaction History Timeline */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
                  Customer Interaction History ({selectedResponse.historyJson?.length || 0})
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(selectedResponse.historyJson || []).map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-xl border text-xs ${
                        entry.role === 'customer'
                          ? 'bg-white border-slate-200'
                          : 'bg-[#EEF3FF]/60 border-indigo-200/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#141936]">
                          {entry.actor}{' '}
                          <span className="text-[10px] font-semibold uppercase text-[#414CCE]">
                            ({entry.role})
                          </span>
                        </span>
                        <span className="text-[10px] text-[#81879C]">{entry.timestamp}</span>
                      </div>
                      <p className="text-[#454654] leading-relaxed whitespace-pre-wrap">
                        {entry.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Composer */}
              <form onSubmit={handleSaveDetailReply} className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#141936]">
                    Agent Response &amp; Resolution Update
                  </label>
                  <button
                    type="button"
                    onClick={handleDraftWithGemini}
                    disabled={generatingDraft}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2EEFF] text-[#5C4BC3] text-xs font-bold hover:bg-indigo-100 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingDraft ? 'animate-spin' : ''}`} />
                    {generatingDraft ? 'Drafting with Gemini...' : 'Draft with Gemini'}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  placeholder="Write a clear response for this customer or generate a draft with Gemini..."
                  className="w-full p-3.5 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none resize-y"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#454654]">Update Status to:</span>
                    <select
                      value={draftStatus}
                      onChange={(e) =>
                        setDraftStatus(e.target.value as 'Pending' | 'Responded' | 'Resolved')
                      }
                      className="h-9 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 font-semibold text-[#141936]"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Responded">Responded</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save & Send Response'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card-elevated rounded-2xl p-12 text-center space-y-2">
              <MessageSquareText className="w-10 h-10 text-[#81879C] mx-auto" />
              <div className="text-sm font-bold text-[#141936]">No Response Selected</div>
              <p className="text-xs text-[#81879C]">
                Select a customer inquiry from the queue or click &ldquo;New Customer Response&rdquo;.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-[#141936]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#141936]">
                {modalMode === 'create' ? 'Add Customer Response' : 'Edit Customer Response'}
              </h2>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-lg hover:bg-[#F7F8FC]"
              >
                <X className="w-5 h-5 text-[#81879C]" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Customer *
                  </label>
                  <select
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(Number(e.target.value))}
                    disabled={modalMode === 'edit'}
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm disabled:opacity-60"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.organization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Assigned Agent
                  </label>
                  <input
                    value={formAgent}
                    onChange={(e) => setFormAgent(e.target.value)}
                    placeholder="Dr. Clara Vance"
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#454654] mb-1">
                  Inquiry Subject *
                </label>
                <input
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g., Canvas SSO metadata refresh needed before midterms"
                  className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as 'Pending' | 'Responded' | 'Resolved')
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Responded">Responded</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">Channel</label>
                  <select
                    value={formChannel}
                    onChange={(e) =>
                      setFormChannel(
                        e.target.value as 'Support Portal' | 'Email' | 'Live Chat'
                      )
                    }
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm"
                  >
                    <option value="Support Portal">Support Portal</option>
                    <option value="Email">Email</option>
                    <option value="Live Chat">Live Chat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#454654] mb-1">
                  Customer Query *
                </label>
                <textarea
                  rows={3}
                  value={formQueryText}
                  onChange={(e) => setFormQueryText(e.target.value)}
                  placeholder="Describe the customer's question or issue..."
                  className="w-full p-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#454654] mb-1">
                  Response Message
                </label>
                <textarea
                  rows={3}
                  value={formResponseText}
                  onChange={(e) => setFormResponseText(e.target.value)}
                  placeholder="Optional if status is Pending; required for Responded or Resolved..."
                  className="w-full p-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl bg-[#F7F8FC] text-xs font-semibold text-[#454654]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Response'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 bg-[#141936]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-[#141936]">Delete Customer Response?</h3>
            <p className="text-xs text-[#454654] leading-relaxed">
              This permanently removes this inquiry and its interaction timeline from your database.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-[#F7F8FC] text-xs font-semibold text-[#454654]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(confirmDeleteId)}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#BA1A1A] text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete Response'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
