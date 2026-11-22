"use client"

import { useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { api, Payment, ChitGroup, Member } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { DataTable2, TableColumn } from "@/components/ui/data-table-2"
import { PageHeader6 } from "@/components/ui/page-header-6"
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Send,
  Trash2,
  X,
  Receipt,
  Phone,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react"
import { SvglWhatsapp } from "@/components/ui/svgl-icons"

export default function DashboardPage() {
  const { role, activeOrg } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [groups, setGroups] = useState<ChitGroup[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)

  // Record Payment Modal State
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("")
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("")
  const [installmentNo, setInstallmentNo] = useState<number>(1)
  const [amount, setAmount] = useState<number>(5000)
  const [mode, setMode] = useState<string>("upi")
  const [txnRef, setTxnRef] = useState<string>("")
  const [remarks, setRemarks] = useState<string>("")
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true)
  const [receiptSuccess, setReceiptSuccess] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [paymentsData, groupsData, membersData] = await Promise.all([
        api.getPayments(),
        api.getGroups(),
        api.getMembers(),
      ])
      setPayments(paymentsData)
      setGroups(groupsData)
      setMembers(membersData)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to load collection records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Auto-fill amount based on selected plan
  const handleGroupChange = (gId: number) => {
    setSelectedGroupId(gId)
    const found = groups.find((g) => g.id === gId)
    if (found) {
      setAmount(found.monthly_installment)
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroupId || !selectedMemberId) return

    try {
      setSubmitting(true)
      const newPayment = await api.createPayment({
        chit_group_id: Number(selectedGroupId),
        member_id: Number(selectedMemberId),
        installment_number: Number(installmentNo),
        amount_paid: Number(amount),
        payment_mode: mode,
        transaction_ref: txnRef || undefined,
        remarks: remarks || undefined,
      })

      // Send WhatsApp Receipt if checked
      if (sendWhatsApp) {
        const member = members.find((m) => m.id === Number(selectedMemberId))
        const group = groups.find((g) => g.id === Number(selectedGroupId))
        if (member && member.phone) {
          try {
            await api.sendWhatsAppMessage(
              "admin",
              member.phone,
              `Receipt from ${activeOrg.name}: Received ₹${amount} for ${group?.group_name || "Chit Scheme"} (Month #${installmentNo}) via ${mode.toUpperCase()}. Ref: ${txnRef || "CASH"}. Thank you!`
            )
            setReceiptSuccess(`Payment recorded and WhatsApp receipt dispatched to ${member.name} (${member.phone})!`)
          } catch {
            setReceiptSuccess(`Payment recorded successfully!`)
          }
        }
      } else {
        setReceiptSuccess(`Payment recorded successfully!`)
      }

      setShowModal(false)
      setTxnRef("")
      setRemarks("")
      loadData()
      setTimeout(() => setReceiptSuccess(null), 4000)
    } catch (err: any) {
      alert(err.message || "Failed to record payment.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this payment collection record?")) return
    try {
      await api.deletePayment(id)
      loadData()
    } catch (err: any) {
      alert(err.message || "Error deleting payment")
    }
  }

  // Filtered payments by group
  const displayPayments = payments.filter((p) => {
    return groupFilter === "all" || p.chit_group_id === Number(groupFilter)
  })

  const paymentColumns: TableColumn<Payment>[] = [
    {
      id: "member",
      header: "Customer / Member",
      sortable: true,
      cell: (p) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{p.member?.name || `Customer #${p.member_id}`}</span>
          {p.member?.phone && (
            <span className="block text-[10px] text-slate-400 font-normal">{p.member.phone}</span>
          )}
        </div>
      ),
    },
    {
      id: "group",
      header: "Chit Plan",
      sortable: true,
      cell: (p) => (
        <span className="text-slate-700 dark:text-slate-300">
          {p.group?.group_name || `Plan #${p.chit_group_id}`}
        </span>
      ),
    },
    {
      id: "installment_number",
      header: "Month",
      sortable: true,
      cell: (p) => (
        <span className="font-mono text-slate-600 dark:text-slate-400">
          Month #{p.installment_number}
        </span>
      ),
    },
    {
      id: "amount_paid",
      header: "Amount Paid",
      sortable: true,
      cell: (p) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(p.amount_paid)}
        </span>
      ),
    },
    {
      id: "payment_mode",
      header: "Mode",
      sortable: true,
      cell: (p) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
            p.payment_mode === "upi"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              : p.payment_mode === "cash"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          }`}
        >
          {p.payment_mode}
        </span>
      ),
    },
    {
      id: "transaction_ref",
      header: "Txn Reference",
      cell: (p) => (
        <span className="font-mono text-[11px] text-slate-500">
          {p.transaction_ref || "-"}
        </span>
      ),
    },
    {
      id: "payment_date",
      header: "Date",
      sortable: true,
      cell: (p) => (
        <span className="text-slate-500 text-[11px]">
          {new Date(p.payment_date).toLocaleDateString("en-IN")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (p) => (
        <button
          onClick={() => handleDelete(p.id)}
          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
          title="Delete payment record"
        >
          <Trash2 className="size-3.5" />
        </button>
      ),
    },
  ]

  // Summary figures
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0)
  const upiCollected = payments.filter((p) => p.payment_mode === "upi").reduce((sum, p) => sum + p.amount_paid, 0)
  const cashCollected = payments.filter((p) => p.payment_mode === "cash").reduce((sum, p) => sum + p.amount_paid, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <DashboardShell pageTitle="Monthly Payments Collection">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* Success Toast */}
        {receiptSuccess && (
          <div className="p-3.5 text-xs rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>{receiptSuccess}</span>
            </div>
            <button onClick={() => setReceiptSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Header Toolbar & KPI Row using @7ovr/page-header-6 */}
        <PageHeader6
          tag="Overview & Collections"
          title="Monthly Payment Collections"
          description="Live collection ledger, installment tracking, and WhatsApp digital receipts."
          actions={
            <button
              onClick={() => {
                if (groups.length === 0) {
                  alert("Please create at least one Chit Plan before collecting payments.")
                  return
                }
                if (members.length === 0) {
                  alert("Please register at least one Customer before collecting payments.")
                  return
                }
                setSelectedGroupId(groups[0]?.id || "")
                setSelectedMemberId(members[0]?.id || "")
                setAmount(groups[0]?.monthly_installment || 5000)
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="size-4" />
              <span>Record Payment</span>
            </button>
          }
          stats={[
            {
              label: "Total Collections",
              value: loading ? "..." : formatCurrency(totalCollected),
              delta: `${payments.length} installments logged`,
              deltaType: "positive",
            },
            {
              label: "UPI / Online Settled",
              value: loading ? "..." : formatCurrency(upiCollected),
              delta: "Digital settlements",
              deltaType: "positive",
            },
            {
              label: "Cash Collections",
              value: loading ? "..." : formatCurrency(cashCollected),
              delta: "Physical vouchers",
              deltaType: "neutral",
            },
            {
              label: "Active Chit Schemes",
              value: `${groups.length} Pools`,
              delta: `${members.length} Subscribers enrolled`,
              deltaType: "positive",
            },
          ]}
        />

        {/* Payment Ledger Table with @7ovr/table-2 design */}
        <DataTable2<Payment>
          data={displayPayments}
          columns={paymentColumns}
          getId={(p) => p.id}
          searchPlaceholder="Search customer, plan, or reference..."
          searchKey={(p) =>
            `${p.member?.name || ""} ${p.group?.group_name || ""} ${p.transaction_ref || ""}`
          }
          pageSize={7}
          emptyMessage="No payment records found. Click 'Record Payment' to log collections."
          filterSlot={
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="size-3.5 text-slate-400" />
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none"
              >
                <option value="all">All Chit Plans</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.group_name}
                  </option>
                ))}
              </select>
            </div>
          }
          bulkActions={{
            onDownload: (selected) => {
              alert(`Exporting ${selected.length} payment vouchers as PDF...`)
            },
            onSendReminder: (selected) => {
              alert(`Dispatching digital receipts to ${selected.length} subscribers via WhatsApp...`)
            },
            onDelete: (selected) => {
              if (confirm(`Delete ${selected.length} selected payment records?`)) {
                Promise.all(selected.map((s) => api.deletePayment(s.id))).then(() => loadData())
              }
            },
          }}
        />

        {/* Modal: Record Payment */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="size-4 text-emerald-600" />
                  <span>Record Monthly Installment</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Chit Plan *</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => handleGroupChange(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    required
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.group_name} (₹{g.monthly_installment}/mo)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Customer / Member *</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    required
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Installment Month</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={installmentNo}
                      onChange={(e) => setInstallmentNo(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Amount Paid (₹) *</label>
                    <input
                      type="number"
                      min={100}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payment Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="upi">UPI / GPay / PhonePe</option>
                      <option value="cash">Cash Voucher</option>
                      <option value="bank_transfer">Bank NEFT/IMPS</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Transaction Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-9842"
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SvglWhatsapp size={18} className="size-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Send WhatsApp Receipt</p>
                      <p className="text-[10px] text-slate-500">Auto-dispatches receipt message to customer</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendWhatsApp}
                    onChange={(e) => setSendWhatsApp(e.target.checked)}
                    className="size-4 text-emerald-600 rounded"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    {submitting ? "Recording..." : "Record & Confirm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
