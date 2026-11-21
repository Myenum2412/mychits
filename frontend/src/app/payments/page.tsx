"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { api, Payment, ChitGroup, Member } from "@/lib/api";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  CreditCard,
  CheckCircle,
  User,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  // Record Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [groupId, setGroupId] = useState<number | "">("");
  const [memberId, setMemberId] = useState<number | "">("");
  const [installmentNumber, setInstallmentNumber] = useState<number>(1);
  const [amountPaid, setAmountPaid] = useState<number>(5000);
  const [paymentMode, setPaymentMode] = useState<string>("upi");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, groupsData, membersData] = await Promise.all([
        api.getPayments(selectedGroupFilter ? Number(selectedGroupFilter) : undefined),
        api.getGroups(),
        api.getMembers(),
      ]);
      setPayments(paymentsData);
      setGroups(groupsData);
      setMembers(membersData);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payments data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedGroupFilter]);

  const activeGroup = groups.find((g) => g.id === Number(groupId));

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !memberId) return;

    try {
      await api.createPayment({
        chit_group_id: Number(groupId),
        member_id: Number(memberId),
        installment_number: Number(installmentNumber),
        amount_paid: Number(amountPaid),
        payment_mode: paymentMode,
        transaction_ref: transactionRef || undefined,
        remarks: remarks || undefined,
      });
      setShowModal(false);
      setTransactionRef("");
      setRemarks("");
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error recording payment");
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await api.deletePayment(id);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting payment");
    }
  };

  return (
    <DashboardShell pageTitle="Collections & Receipts">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Filter Group:
            </label>
            <select
              value={selectedGroupFilter}
              onChange={(e) =>
                setSelectedGroupFilter(e.target.value ? Number(e.target.value) : "")
              }
              className="px-3 py-1.5 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="">All Chit Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.group_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (groups.length > 0 && !groupId) {
                setGroupId(groups[0].id);
                setAmountPaid(groups[0].monthly_installment);
              }
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payments Table */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="h-14 w-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Receipt className="h-7 w-7" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100">No Payments Recorded</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your database has zero pre-seeded payment receipts. Click "Record Payment" to log subscriber installments.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Receipt #</th>
                    <th className="px-6 py-3.5">Subscriber</th>
                    <th className="px-6 py-3.5">Group & Month</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                    <th className="px-6 py-3.5">Mode</th>
                    <th className="px-6 py-3.5">Ref / TXN ID</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        REC-{p.id.toString().padStart(5, "0")}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {p.member?.name || `Member #${p.member_id}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          Group #{p.chit_group_id}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Month #{p.installment_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{p.amount_paid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs uppercase px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.payment_mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {p.transaction_ref || "-"}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete Payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Record Payment */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Record Installment Payment
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-slate-500">
                    No chit groups exist yet. Create a chit group and enroll members first.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chit Group *
                    </label>
                    <select
                      required
                      value={groupId}
                      onChange={(e) => {
                        const gid = Number(e.target.value);
                        setGroupId(gid);
                        const grp = groups.find((g) => g.id === gid);
                        if (grp) setAmountPaid(grp.monthly_installment);
                      }}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Chit Group --</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.group_name} (₹{g.monthly_installment}/mo)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subscriber / Member *
                    </label>
                    <select
                      required
                      value={memberId}
                      onChange={(e) => setMemberId(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Member --</option>
                      {activeGroup && activeGroup.memberships?.length > 0 ? (
                        activeGroup.memberships.map((gm) => (
                          <option key={gm.id} value={gm.member_id}>
                            Ticket #{gm.ticket_number} - {gm.member?.name || `Member #${gm.member_id}`}
                          </option>
                        ))
                      ) : (
                        members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.phone})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Installment Month #
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={installmentNumber}
                        onChange={(e) => setInstallmentNumber(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Amount Paid (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Mode
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="upi">UPI (GPay/PhonePe/Paytm)</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Transaction / Cheque Ref
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UPI12345678"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Notes / Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="Optional notes"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm font-medium"
                    >
                      Save Receipt
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
