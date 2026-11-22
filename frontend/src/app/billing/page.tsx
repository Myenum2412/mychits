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
  Clock,
  AlertTriangle,
  Download,
  Send,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  X,
  FileText,
  DollarSign,
  Building,
} from "lucide-react"
import { SvglWhatsapp } from "@/components/ui/svgl-icons"

interface InvoiceItem {
  id: string
  invoiceNumber: string
  customerName: string
  phone: string
  planName: string
  installmentNumber: number
  amount: number
  dividendDiscount: number
  netPayable: number
  dueDate: string
  status: "paid" | "pending" | "overdue"
  paymentMethod?: string
}

export default function BillingPage() {
  const { activeOrg } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [groups, setGroups] = useState<ChitGroup[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New Invoice Form state
  const [newCustomer, setNewCustomer] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newPlan, setNewPlan] = useState("")
  const [newAmount, setNewAmount] = useState(5000)
  const [newDueDate, setNewDueDate] = useState("")
  const [customInvoices, setCustomInvoices] = useState<InvoiceItem[]>([])

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
    } catch {
      // Backend fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Derive invoices from recorded payments and generated recurring member schedules
  const derivedInvoices: InvoiceItem[] = []

  // Invoices from recorded payments
  payments.forEach((p, idx) => {
    const net = p.amount_paid
    const discount = Math.round(net * 0.05)
    derivedInvoices.push({
      id: `inv-paid-${p.id}`,
      invoiceNumber: `INV-2026-${String(1000 + p.id).slice(-4)}`,
      customerName: p.member?.name || `Customer #${p.member_id}`,
      phone: p.member?.phone || "+91 98765 00000",
      planName: p.group?.group_name || `Plan #${p.chit_group_id}`,
      installmentNumber: p.installment_number,
      amount: net + discount,
      dividendDiscount: discount,
      netPayable: net,
      dueDate: new Date(p.payment_date).toLocaleDateString("en-IN"),
      status: "paid",
      paymentMethod: p.payment_mode.toUpperCase(),
    })
  })

  // Sample scheduled upcoming dues if member/groups exist
  if (members.length > 0 && groups.length > 0) {
    members.forEach((m, i) => {
      const g = groups[i % groups.length]
      if (g) {
        const net = g.monthly_installment
        const disc = Math.round(net * 0.04)
        derivedInvoices.push({
          id: `inv-sched-${m.id}`,
          invoiceNumber: `INV-2026-${String(2000 + m.id).slice(-4)}`,
          customerName: m.name,
          phone: m.phone || "+91 98765 00000",
          planName: g.group_name,
          installmentNumber: 2,
          amount: net,
          dividendDiscount: disc,
          netPayable: net - disc,
          dueDate: "2026-12-05",
          status: i % 2 === 0 ? "pending" : "overdue",
        })
      }
    })
  } else if (derivedInvoices.length === 0 && customInvoices.length === 0) {
    // Default baseline for demonstration if zero records exist
    derivedInvoices.push(
      {
        id: "inv-demo-1",
        invoiceNumber: "INV-2026-0042",
        customerName: "Rajesh Sharma",
        phone: "+91 98450 12345",
        planName: "Super Gold 1 Lakh (20M)",
        installmentNumber: 3,
        amount: 5000,
        dividendDiscount: 250,
        netPayable: 4750,
        dueDate: "2026-11-25",
        status: "pending",
      },
      {
        id: "inv-demo-2",
        invoiceNumber: "INV-2026-0043",
        customerName: "Priya Sundaram",
        phone: "+91 99800 67890",
        planName: "Diamond 5 Lakhs (25M)",
        installmentNumber: 4,
        amount: 20000,
        dividendDiscount: 1200,
        netPayable: 18800,
        dueDate: "2026-11-15",
        status: "overdue",
      },
      {
        id: "inv-demo-3",
        invoiceNumber: "INV-2026-0041",
        customerName: "Karthik Venkat",
        phone: "+91 97400 34567",
        planName: "Silver Wealth 50K (10M)",
        installmentNumber: 2,
        amount: 5000,
        dividendDiscount: 300,
        netPayable: 4700,
        dueDate: "2026-11-05",
        status: "paid",
        paymentMethod: "UPI",
      }
    )
  }

  const allInvoices = [...customInvoices, ...derivedInvoices]

  const invoiceColumns: TableColumn<InvoiceItem>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      sortable: true,
      cell: (inv) => (
        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
          {inv.invoiceNumber}
        </span>
      ),
    },
    {
      id: "customerName",
      header: "Customer / Member",
      sortable: true,
      cell: (inv) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">{inv.customerName}</div>
          <div className="text-[10px] text-slate-400">{inv.phone}</div>
        </div>
      ),
    },
    {
      id: "planName",
      header: "Chit Scheme",
      sortable: true,
      cell: (inv) => (
        <div>
          <div className="text-slate-700 dark:text-slate-300">{inv.planName}</div>
          <div className="text-[10px] text-slate-400">Month #{inv.installmentNumber}</div>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Installment",
      sortable: true,
      cell: (inv) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {formatCurrency(inv.amount)}
        </span>
      ),
    },
    {
      id: "dividendDiscount",
      header: "Dividend Offset",
      sortable: true,
      cell: (inv) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          - {formatCurrency(inv.dividendDiscount)}
        </span>
      ),
    },
    {
      id: "netPayable",
      header: "Net Payable",
      sortable: true,
      cell: (inv) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(inv.netPayable)}
        </span>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      sortable: true,
      cell: (inv) => <span className="font-mono text-slate-500 text-[11px]">{inv.dueDate}</span>,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (inv) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            inv.status === "paid"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : inv.status === "pending"
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {inv.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (inv) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleSendReminder(inv)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Dispatch WhatsApp Invoice & Reminder"
          >
            <SvglWhatsapp size={14} className="hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => alert(`Printing Invoice ${inv.invoiceNumber} for ${inv.customerName}`)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
            title="Download PDF Bill"
          >
            <Download className="size-3.5" />
          </button>
        </div>
      ),
    },
  ]

  const displayInvoices = allInvoices.filter((inv) => {
    return statusFilter === "all" || inv.status === statusFilter
  })

  // KPI Computations
  const totalInvoiced = allInvoices.reduce((acc, curr) => acc + curr.netPayable, 0)
  const totalPaid = allInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, curr) => acc + curr.netPayable, 0)
  const totalPending = allInvoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .reduce((acc, curr) => acc + curr.netPayable, 0)
  const overdueCount = allInvoices.filter((inv) => inv.status === "overdue").length

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleSendReminder = (inv: InvoiceItem) => {
    setToastMessage(`WhatsApp payment reminder & digital invoice link dispatched to ${inv.customerName} (${inv.phone})`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer || !newPlan) return

    const newInv: InvoiceItem = {
      id: `inv-custom-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newCustomer,
      phone: newPhone || "+91 98765 43210",
      planName: newPlan,
      installmentNumber: 1,
      amount: Number(newAmount),
      dividendDiscount: 0,
      netPayable: Number(newAmount),
      dueDate: newDueDate || new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setCustomInvoices([newInv, ...customInvoices])
    setShowModal(false)
    setNewCustomer("")
    setNewPhone("")
    setNewPlan("")
    setToastMessage(`Bill ${newInv.invoiceNumber} generated successfully!`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <DashboardShell pageTitle="Billing & Invoicing">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 text-xs rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Header Toolbar & KPI Grid using @7ovr/page-header-6 */}
        <PageHeader6
          tag="Invoicing & Statements"
          title="Billing & Monthly Invoices"
          description="Generate monthly subscriber bills, dividend tax credit statements & payment receipts."
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  alert("Generating all monthly PDF statements for " + activeOrg.name + "...")
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl shadow-xs transition-colors"
              >
                <Download className="size-3.5" />
                <span>Export Ledger</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="size-4" />
                <span>Generate Bill</span>
              </button>
            </div>
          }
          stats={[
            {
              label: "Total Invoiced",
              value: formatCurrency(totalInvoiced),
              delta: `${allInvoices.length} invoices generated`,
              deltaType: "neutral",
            },
            {
              label: "Settled & Paid",
              value: formatCurrency(totalPaid),
              delta: "Cleared via UPI & Cash",
              deltaType: "positive",
            },
            {
              label: "Outstanding Dues",
              value: formatCurrency(totalPending),
              delta: "Active payment cycles",
              deltaType: "negative",
            },
            {
              label: "Overdue Invoices",
              value: overdueCount,
              delta: overdueCount > 0 ? "Requires reminder dispatch" : "Zero overdue bills",
              deltaType: overdueCount > 0 ? "negative" : "positive",
            },
          ]}
        />

        {/* Billing Table with @7ovr/table-2 design */}
        <DataTable2<InvoiceItem>
          data={displayInvoices}
          columns={invoiceColumns}
          getId={(inv) => inv.id}
          searchPlaceholder="Search subscriber, invoice #, or chit scheme..."
          searchKey={(inv) => `${inv.customerName} ${inv.invoiceNumber} ${inv.planName} ${inv.phone}`}
          pageSize={7}
          emptyMessage="No invoices match the selected filter."
          filterSlot={
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground text-[11px] font-medium">Status:</span>
              <div className="flex items-center p-0.5 bg-muted rounded-lg">
                {["all", "paid", "pending", "overdue"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-[11px] font-semibold capitalize rounded-md transition-all ${
                      statusFilter === st
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          }
          bulkActions={{
            onDownload: (selected) => {
              alert(`Downloading PDF package for ${selected.length} invoices...`)
            },
            onSendReminder: (selected) => {
              alert(`Dispatching WhatsApp payment reminder to ${selected.length} subscribers...`)
            },
            onMarkPaid: (selected) => {
              alert(`Marked ${selected.length} invoices as Paid!`)
            },
          }}
        />

        {/* Modal: Generate Custom Bill */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="size-4 text-indigo-600" />
                  <span>Generate Subscriber Bill</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Subscriber Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kumar"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Chit Scheme Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Diamond 2 Lakhs (20 Months)"
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Installment Due (₹) *
                    </label>
                    <input
                      type="number"
                      min={100}
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Issue Bill
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
