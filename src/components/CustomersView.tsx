import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Edit3,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.tsx';
import type { CustomerItem } from '../data/initialData.ts';

const TIER_OPTIONS: Array<CustomerItem['tier']> = ['Enterprise', 'Campus', 'Department'];
const STATUS_OPTIONS: Array<CustomerItem['status']> = ['Active', 'Onboarding', 'Attention'];

export function CustomersView() {
  const {
    customers,
    customerResponses,
    selectedCustomerId,
    setSelectedCustomerId,
    setSelectedResponseId,
    setActiveNav,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    globalSearch,
    syncing,
  } = useWorkspace();

  const [localSearch, setLocalSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | CustomerItem['tier']>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CustomerItem['status']>('All');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form fields matching CustomerItem
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState<CustomerItem['tier']>('Campus');
  const [status, setStatus] = useState<CustomerItem['status']>('Active');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase();

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== 'All' && c.tier !== tierFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (!combinedSearch) return true;
      return (
        c.name.toLowerCase().includes(combinedSearch) ||
        c.email.toLowerCase().includes(combinedSearch) ||
        c.organization.toLowerCase().includes(combinedSearch) ||
        c.roleTitle.toLowerCase().includes(combinedSearch) ||
        c.tier.toLowerCase().includes(combinedSearch)
      );
    });
  }, [customers, tierFilter, statusFilter, combinedSearch]);

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || filteredCustomers[0] || customers[0] || null;

  const selectedCustomerResponses = useMemo(() => {
    if (!selectedCustomer) return [];
    return customerResponses.filter((r) => r.customerId === selectedCustomer.id);
  }, [customerResponses, selectedCustomer]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingCustomer(null);
    setName('');
    setEmail('');
    setOrganization('');
    setRoleTitle('');
    setPhone('');
    setTier('Campus');
    setStatus('Active');
    setFormError(null);
  };

  const openEditModal = (cust: CustomerItem) => {
    setModalMode('edit');
    setEditingCustomer(cust);
    setName(cust.name);
    setEmail(cust.email);
    setOrganization(cust.organization);
    setRoleTitle(cust.roleTitle);
    setPhone(cust.phone);
    setTier(cust.tier);
    setStatus(cust.status);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!organization.trim()) {
      setFormError('Organization or institution name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await createCustomer({
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          roleTitle: roleTitle.trim() || 'Program Coordinator',
          phone: phone.trim() || 'Not provided',
          tier,
          status,
        });
      } else if (modalMode === 'edit' && editingCustomer) {
        await updateCustomer(editingCustomer.id, {
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          roleTitle: roleTitle.trim() || 'Program Coordinator',
          phone: phone.trim() || 'Not provided',
          tier,
          status,
        });
      }
      setModalMode(null);
    } catch (err: any) {
      setFormError(err.message || 'Unable to save customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      setSubmitting(true);
      await deleteCustomer(id);
      setConfirmDeleteId(null);
    } catch {
      // handled in context toast
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = customers.filter((c) => c.status === 'Active').length;
  const enterpriseCount = customers.filter((c) => c.tier === 'Enterprise').length;
  const attentionCount = customers.filter((c) => c.status === 'Attention').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#414CCE]">
            <span>CUSTOMER DIRECTORY</span>
            <span className="text-[#81879C]">• {customers.length} Organizations</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#141936] mt-0.5">Customers</h1>
          <p className="text-sm text-[#454654] mt-0.5">
            Manage institutional accounts, contact profiles, and linked customer support inquiries.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] shadow-sm whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
            Total Customers
          </div>
          <div className="text-2xl font-extrabold text-[#141936] tabular-nums mt-1">
            {customers.length}
          </div>
          <div className="text-xs text-[#454654] mt-1">Institutional &amp; department accounts</div>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
            Active Accounts
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
            {activeCount}
          </div>
          <div className="text-xs text-[#454654] mt-1">In good standing</div>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
            Enterprise Tier
          </div>
          <div className="text-2xl font-extrabold text-[#414CCE] tabular-nums mt-1">
            {enterpriseCount}
          </div>
          <div className="text-xs text-[#454654] mt-1">Priority SLA coverage</div>
        </div>
        <div className="card-elevated rounded-2xl p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#81879C]">
            Needs Attention
          </div>
          <div className="text-2xl font-extrabold text-[#BA1A1A] tabular-nums mt-1">
            {attentionCount}
          </div>
          <div className="text-xs text-[#454654] mt-1">Flagged for follow-up</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card-elevated rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#81879C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter by name, email, role, or organization..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm text-[#141936] focus:bg-white focus:border-[#5B67E8] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as 'All' | CustomerItem['tier'])}
            className="h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs font-semibold text-[#141936] focus:outline-none"
            aria-label="Filter by tier"
          >
            <option value="All">All Tiers</option>
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | CustomerItem['status'])}
            className="h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-xs font-semibold text-[#141936] focus:outline-none"
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer Directory List */}
        <div className="lg:col-span-7 space-y-3">
          {syncing && customers.length === 0 ? (
            <div className="card-elevated rounded-2xl p-10 text-center text-sm text-[#81879C]">
              Loading customers...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="card-elevated rounded-2xl p-10 text-center space-y-3">
              <Users className="w-10 h-10 text-[#81879C] mx-auto" />
              <div className="text-sm font-bold text-[#141936]">No customers match your filters</div>
              <p className="text-xs text-[#81879C]">
                Clear active filters or add a new customer account to begin tracking responses.
              </p>
              <button
                onClick={() => {
                  setLocalSearch('');
                  setTierFilter('All');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#EEF3FF] text-[#414CCE] text-xs font-bold hover:bg-[#E0E7FF]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const selected = selectedCustomer?.id === c.id;
              const respCount = customerResponses.filter((r) => r.customerId === c.id).length;
              const pendingCount = customerResponses.filter(
                (r) => r.customerId === c.id && r.status === 'Pending'
              ).length;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomerId(c.id)}
                  className={`card-elevated rounded-2xl p-4 cursor-pointer transition-all ${
                    selected
                      ? 'ring-2 ring-[#414CCE] bg-[#EEF3FF]/25'
                      : 'hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#EEF3FF] text-[#414CCE] font-bold text-sm flex items-center justify-center shrink-0">
                        {c.name
                          .split(' ')
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[#141936] truncate">{c.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : c.status === 'Onboarding'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-[#FFE9E9] text-[#BA1A1A]'
                            }`}
                          >
                            {c.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[10px] font-semibold">
                            {c.tier}
                          </span>
                        </div>
                        <div className="text-xs text-[#454654] mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-[#81879C]" />
                            {c.organization}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#81879C]" />
                            {c.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-[#F7F8FC] text-[11px] font-semibold text-[#454654] tabular-nums">
                        {respCount} {respCount === 1 ? 'ticket' : 'tickets'}
                        {pendingCount > 0 ? ` (${pendingCount} pending)` : ''}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(c);
                        }}
                        className="p-2 rounded-xl text-[#454654] hover:bg-[#EEF3FF] hover:text-[#414CCE]"
                        title="Edit customer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(c.id);
                        }}
                        className="p-2 rounded-xl text-[#81879C] hover:bg-[#FFE9E9] hover:text-[#BA1A1A]"
                        title="Delete customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Customer Profile & Linked Inquiries */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCustomer ? (
            <div className="card-elevated rounded-2xl p-5 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EEF3FF] text-[#414CCE] text-[11px] font-bold">
                    {selectedCustomer.tier}
                  </span>
                  <h2 className="text-lg font-bold text-[#141936] mt-2">{selectedCustomer.name}</h2>
                  <div className="text-xs text-[#454654]">{selectedCustomer.organization}</div>
                </div>
                <button
                  onClick={() => openEditModal(selectedCustomer)}
                  className="px-3 py-1.5 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] text-xs font-semibold text-[#141936]"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs bg-[#F7F8FC] rounded-xl p-3.5 border border-slate-200/70">
                <div className="flex items-center gap-2 text-[#454654]">
                  <Briefcase className="w-3.5 h-3.5 text-[#414CCE]" />
                  <span>{selectedCustomer.roleTitle}</span>
                </div>
                <div className="flex items-center gap-2 text-[#454654]">
                  <Mail className="w-3.5 h-3.5 text-[#414CCE]" />
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#454654]">
                  <Phone className="w-3.5 h-3.5 text-[#414CCE]" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#454654]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Status: {selectedCustomer.status}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#141936]">
                    Recent Responses ({selectedCustomerResponses.length})
                  </span>
                  <button
                    onClick={() => setActiveNav('responses')}
                    className="text-xs font-semibold text-[#414CCE] hover:underline"
                  >
                    Manage Responses &rarr;
                  </button>
                </div>

                {selectedCustomerResponses.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#F7F8FC] text-xs text-[#81879C] text-center">
                    No customer inquiries logged for this account yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomerResponses.map((resp) => (
                      <button
                        key={resp.id}
                        onClick={() => {
                          setSelectedResponseId(resp.id);
                          setActiveNav('responses');
                        }}
                        className="w-full text-left p-3 rounded-xl bg-[#F7F8FC] hover:bg-[#EEF3FF] border border-slate-200/70 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#141936] truncate flex items-center gap-1.5">
                            <MessageSquareText className="w-3.5 h-3.5 text-[#414CCE] shrink-0" />
                            {resp.subject}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              resp.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : resp.status === 'Responded'
                                ? 'bg-[#EEF3FF] text-[#414CCE]'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {resp.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#454654] line-clamp-2 mt-1">
                          {resp.queryText}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-elevated rounded-2xl p-8 text-center text-xs text-[#81879C]">
              Select a customer to inspect profile details and response history.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-[#141936]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#141936]">
                {modalMode === 'create' ? 'Add New Customer' : 'Edit Customer Profile'}
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Contact Name *
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Maya Lin"
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Organization *
                  </label>
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g., Pacific State University"
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Role / Title
                  </label>
                  <input
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g., LMS Operations Director"
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Phone Number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 010-2030"
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm focus:bg-white focus:border-[#5B67E8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Plan Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CustomerItem['tier'])}
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm"
                  >
                    {TIER_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#454654] mb-1">
                    Account Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CustomerItem['status'])}
                    className="w-full h-10 px-3 rounded-xl bg-[#F7F8FC] border border-slate-200 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#414CCE] text-white text-xs font-bold hover:bg-[#3540B8] disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : modalMode === 'create'
                    ? 'Create Customer'
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
            <h3 className="text-base font-bold text-[#141936]">Delete Customer Account?</h3>
            <p className="text-xs text-[#454654] leading-relaxed">
              This removes the customer record and any linked customer responses from your active
              workspace. This action cannot be undone.
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
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#BA1A1A] text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
