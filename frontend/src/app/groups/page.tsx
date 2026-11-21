"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { api, ChitGroup, Member } from "@/lib/api";
import {
  Layers,
  Plus,
  Trash2,
  UserPlus,
  X,
  AlertCircle,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Group Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    group_name: "",
    total_value: 100000,
    duration_months: 20,
    monthly_installment: 5000,
    max_members: 20,
    commission_rate: 5.0,
    start_date: "",
    status: "active",
  });

  // Enroll Member Modal
  const [selectedGroup, setSelectedGroup] = useState<ChitGroup | null>(null);
  const [enrollMemberId, setEnrollMemberId] = useState<number | "">("");
  const [enrollTicketNumber, setEnrollTicketNumber] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, membersData] = await Promise.all([
        api.getGroups(),
        api.getMembers(),
      ]);
      setGroups(groupsData);
      setMembers(membersData);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      start_date: new Date().toISOString().split("T")[0],
    }));
    loadData();
  }, []);

  // Update monthly_installment automatically when total_value or duration_months changes
  const handleValueChange = (totalVal: number, duration: number) => {
    const installment = duration > 0 ? Math.round(totalVal / duration) : 0;
    setFormData((prev) => ({
      ...prev,
      total_value: totalVal,
      duration_months: duration,
      monthly_installment: installment,
    }));
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGroup(formData);
      setShowCreateModal(false);
      setFormData({
        group_name: "",
        total_value: 100000,
        duration_months: 20,
        monthly_installment: 5000,
        max_members: 20,
        commission_rate: 5.0,
        start_date: new Date().toISOString().split("T")[0],
        status: "active",
      });
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error creating group");
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm("Are you sure you want to delete this chit group?")) return;
    try {
      await api.deleteGroup(id);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting group");
    }
  };

  const handleEnrollMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !enrollMemberId) return;

    try {
      await api.addMemberToGroup(selectedGroup.id, {
        member_id: Number(enrollMemberId),
        ticket_number: Number(enrollTicketNumber),
      });
      setSelectedGroup(null);
      setEnrollMemberId("");
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error enrolling member");
    }
  };

  const handleRemoveMember = async (groupId: number, membershipId: number) => {
    if (!confirm("Remove this member from the chit group?")) return;
    try {
      await api.removeMemberFromGroup(groupId, membershipId);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error removing member");
    }
  };

  return (
    <DashboardShell pageTitle="Chit Schemes & Groups">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Active Chit Schemes
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Define chit pool values, durations, and manage enrolled subscriber tickets.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Chit Group
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading chit groups...</div>
        ) : groups.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="h-14 w-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Layers className="h-7 w-7" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">No Chit Groups Found</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your database has zero pre-seeded groups. Click "Create Chit Group" above to start your first chit fund.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map((grp) => {
              const enrolledCount = grp.memberships?.length || 0;
              const isFull = enrolledCount >= grp.max_members;

              return (
                <div
                  key={grp.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {grp.group_name}
                          </h4>
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                              grp.status === "active"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {grp.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Starts on {grp.start_date}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteGroup(grp.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Value</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          ₹{grp.total_value.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Monthly</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          ₹{grp.monthly_installment.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Duration</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {grp.duration_months} Mos
                        </p>
                      </div>
                    </div>

                    {/* Member Enrollment Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Subscribers Enrolled
                        </span>
                        <span className="text-slate-900 dark:text-slate-200 font-bold">
                          {enrolledCount} / {grp.max_members}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (enrolledCount / grp.max_members) * 100)}%`,
                          }}
                        />
                      </div>

                      {/* Enrolled list pills */}
                      {grp.memberships && grp.memberships.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {grp.memberships.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-md"
                            >
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                #{m.ticket_number}
                              </span>
                              <span>{m.member?.name || `Member #${m.member_id}`}</span>
                              {m.has_prized && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">
                                  Won
                                </span>
                              )}
                              <button
                                onClick={() => handleRemoveMember(grp.id, m.id)}
                                className="text-slate-400 hover:text-rose-500 text-xs ml-0.5"
                                title="Remove ticket"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      disabled={isFull}
                      onClick={() => {
                        setSelectedGroup(grp);
                        const nextTicket = (grp.memberships?.length || 0) + 1;
                        setEnrollTicketNumber(nextTicket);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      {isFull ? "Group Full" : "Enroll Member"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Chit Group */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  New Chit Group
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Group Name / Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CHIT-1L-20M"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Chit Value (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={formData.total_value}
                      onChange={(e) =>
                        handleValueChange(Number(e.target.value), formData.duration_months)
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={formData.duration_months}
                      onChange={(e) =>
                        handleValueChange(formData.total_value, Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Monthly Installment (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.monthly_installment}
                      onChange={(e) =>
                        setFormData({ ...formData, monthly_installment: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Max Subscribers
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.max_members}
                      onChange={(e) =>
                        setFormData({ ...formData, max_members: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Foreman Commission (%)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      step={0.5}
                      value={formData.commission_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, commission_rate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-medium"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Enroll Member */}
        {selectedGroup && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Enroll Member
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Assign subscriber ticket to {selectedGroup.group_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {members.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-sm text-slate-500">
                    No members registered yet. Please add a member first.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnrollMember} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Member
                    </label>
                    <select
                      required
                      value={enrollMemberId}
                      onChange={(e) => setEnrollMemberId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ticket Number (1 to {selectedGroup.max_members})
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedGroup.max_members}
                      value={enrollTicketNumber}
                      onChange={(e) => setEnrollTicketNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGroup(null)}
                      className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-medium"
                    >
                      Enroll Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
