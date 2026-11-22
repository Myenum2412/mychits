"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { api, Payment, ChitGroup, Member } from "@/lib/api";
import { DataTable2, TableColumn } from "@/components/ui/data-table-2";
import { PageHeader6 } from "@/components/ui/page-header-6";
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
  QrCode,
  Link2,
} from "lucide-react";
import { SvglUpi } from "@/components/ui/svgl-icons";
import { YouPICheckoutModal } from "@/components/youpi/youpi-checkout-modal";
import { SendInviteDialog } from "@/components/payments/send-invite-dialog";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);

  // Record Payment Modal
  const [showModal, setShowModal] = useState(false);
  const [showYoupiModal, setShowYoupiModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
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

  const paymentColumns: TableColumn<Payment>[] = [
    {
      id: "id",
      header: "Receipt #",
      sortable: true,
      cell: (p) => (
        <span className="font-mono text-xs text-muted-foreground font-semibold">
          REC-{p.id.toString().padStart(5, "0")}
        </span>
      ),
    },
    {
      id: "member",
      header: "Subscriber",
      sortable: true,
      cell: (p) => (
        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{p.member?.name || `Member #${p.member_id}`}</span>
        </div>
      ),
    },
    {
      id: "group",
      header: "Group & Month",
      cell: (p) => (
        <div>
          <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {p.group?.group_name || `Group #${p.chit_group_id}`}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Month #{p.installment_number}
          </div>
        </div>
      ),
    },
    {
      id: "amount_paid",
      header: "Amount Paid",
      sortable: true,
      cell: (p) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          ₹{p.amount_paid.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "payment_mode",
      header: "Mode",
      sortable: true,
      cell: (p) => (
        <span className="text-xs uppercase px-2 py-0.5 rounded font-medium bg-muted text-foreground inline-flex items-center gap-1.5">
          {p.payment_mode === "upi" ? <SvglUpi size={22} className="h-3 w-auto" /> : null}
          <span>{p.payment_mode}</span>
        </span>
      ),
    },
    {
      id: "transaction_ref",
      header: "Ref / TXN ID",
      cell: (p) => (
        <span className="font-mono text-xs text-muted-foreground">
          {p.transaction_ref || "-"}
        </span>
      ),
    },
    {
      id: "payment_date",
      header: "Date",
      sortable: true,
      cell: (p) => (
        <span className="text-xs text-muted-foreground">
          {new Date(p.payment_date).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      className: "text-right",
      cell: (p) => (
        <button
          onClick={() => handleDeletePayment(p.id)}
          className="text-muted-foreground hover:text-rose-600 transition-colors p-1"
          title="Delete Payment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const totalPaidAmount = payments.reduce((acc, p) => acc + p.amount_paid, 0);
  const upiCount = payments.filter((p) => p.payment_mode === "upi").length;
  const cashCount = payments.filter((p) => p.payment_mode === "cash").length;

  return (
    <DashboardShell pageTitle="Collections & Receipts">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* Header Toolbar & KPI Grid using @7ovr/page-header-6 */}
        <PageHeader6
          tag="Ledger & Receipts"
          title="Collections & Receipts"
          description="Comprehensive installment logs, payment modes, and WhatsApp digital receipts."
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-xl shadow-xs">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Scheme:
                </label>
                <select
                  value={selectedGroupFilter}
                  onChange={(e) =>
                    setSelectedGroupFilter(e.target.value ? Number(e.target.value) : "")
                  }
                  className="text-xs bg-transparent text-foreground border-none focus:outline-none cursor-pointer"
                >
                  <option value="">All Chit Groups</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id} className="bg-card text-foreground">
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  if (groups.length > 0 && !groupId) {
                    setGroupId(groups[0].id);
                  }
                  setShowInviteModal(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Link2 className="h-4 w-4" />
                <span>Send Pay Invite</span>
              </button>

              <button
                onClick={() => {
                  if (groups.length > 0 && !groupId) {
                    setGroupId(groups[0].id);
                    setAmountPaid(groups[0].monthly_installment);
                  }
                  setShowYoupiModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <SvglUpi size={26} className="h-4 w-auto" />
                <span>Pay Online (YouPI PG)</span>
              </button>

              <button
                onClick={() => {
                  if (groups.length > 0 && !groupId) {
                    setGroupId(groups[0].id);
                    setAmountPaid(groups[0].monthly_installment);
                  }
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Record Payment</span>
              </button>
            </div>
          }
          stats={[
            {
              label: "Total Collected",
              value: `₹${totalPaidAmount.toLocaleString("en-IN")}`,
              delta: `${payments.length} receipts logged`,
              deltaType: "positive",
            },
            {
              label: "UPI Settlements",
              value: `${upiCount} receipts`,
              delta: "Digital settlements",
              deltaType: "positive",
            },
            {
              label: "Cash Vouchers",
              value: `${cashCount} receipts`,
              delta: "Counter collections",
              deltaType: "neutral",
            },
            {
              label: "Enrolled Subscribers",
              value: `${members.length} Members`,
              delta: `${groups.length} Chit Pools`,
              deltaType: "positive",
            },
          ]}
        />

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payments Table with @7ovr/table-2 design */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading payments...</div>
        ) : (
          <DataTable2<Payment>
            data={payments}
            columns={paymentColumns}
            getId={(p) => p.id}
            searchPlaceholder="Search receipts by subscriber, TXN reference, or plan..."
            searchKey={(p) =>
              `${p.member?.name || ""} ${p.group?.group_name || ""} ${p.transaction_ref || ""}`
            }
            pageSize={7}
            emptyMessage="No payment receipts found. Click 'Record Payment' to log collections."
            bulkActions={{
              onDownload: (selected) => {
                alert(`Exporting ${selected.length} payment receipts as PDF...`);
              },
              onSendReminder: (selected) => {
                alert(`Dispatching digital receipts for ${selected.length} payments via WhatsApp...`);
              },
              onDelete: (selected) => {
                if (confirm(`Delete ${selected.length} selected payment records?`)) {
                  Promise.all(selected.map((s) => api.deletePayment(s.id))).then(() => loadData());
                }
              },
            }}
          />
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
                        <option value="youpi_upi">YouPI Sovereign Gateway (UPI QR & Intent)</option>
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
        {/* YouPI Sovereign PG Checkout Modal */}
        <YouPICheckoutModal
          open={showYoupiModal}
          onOpenChange={setShowYoupiModal}
          chitGroup={activeGroup || groups[0] || null}
          member={members.find((m) => m.id === Number(memberId)) || members[0] || null}
          amount={amountPaid}
          onPaymentSuccess={() => {
            loadData();
          }}
        />

        {/* Send Payment Invite Dialog */}
        <SendInviteDialog
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          defaultGroup={activeGroup || groups[0] || null}
          defaultMember={members.find((m) => m.id === Number(memberId)) || null}
          defaultAmount={amountPaid}
        />
      </div>
    </DashboardShell>
  );
}
