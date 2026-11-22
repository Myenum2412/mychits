"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { useAuth, Organization } from "@/context/auth-context"
import { DataTable2, TableColumn } from "@/components/ui/data-table-2"
import { PageHeader6 } from "@/components/ui/page-header-6"
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Check,
  ShieldCheck,
  TrendingUp,
  Layers,
  Users,
  ExternalLink,
  X,
  Landmark,
  Building,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react"
import { SvglWhatsapp, SvglGmail } from "@/components/ui/svgl-icons"

interface BranchDetail extends Organization {
  address: string
  phone: string
  email: string
  manager: string
  licenseNo: string
  activeSchemes: number
  totalSubscribers: number
  monthlyTurnover: string
  status: "Active" | "Licensed"
}

export default function BranchesPage() {
  const { organizations, activeOrg, setActiveOrg } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Initial branch details
  const [branchList, setBranchList] = useState<BranchDetail[]>([
    {
      id: "org-1",
      name: "Apex Chits & Finance - HQ",
      plan: "Registered ROSCA",
      code: "APEX-HQ",
      badge: "Primary HQ",
      address: "104 Anna Salai, Commercial Hub, Chennai - 600002",
      phone: "+91 44 2852 4000",
      email: "hq@apexchits.com",
      manager: "K. Ramanathan (Foreperson)",
      licenseNo: "TN-CHIT-REG-2021/884",
      activeSchemes: 12,
      totalSubscribers: 280,
      monthlyTurnover: "₹35,00,000",
      status: "Active",
    },
    {
      id: "org-2",
      name: "Royal Chits Ltd",
      plan: "Licensed Foreperson",
      code: "RYL-SOUTH",
      badge: "South Zone",
      address: "42 100 Feet Road, Indiranagar, Bengaluru - 560038",
      phone: "+91 80 4125 7800",
      email: "south@royalchits.in",
      manager: "S. Venkatesh",
      licenseNo: "KA-CHIT-REG-2022/312",
      activeSchemes: 8,
      totalSubscribers: 160,
      monthlyTurnover: "₹18,50,000",
      status: "Active",
    },
    {
      id: "org-3",
      name: "Sri Lakshmi Mutual Chits",
      plan: "Enterprise",
      code: "SLM-NORTH",
      badge: "North Zone",
      address: "18 Somajiguda Circle, Raj Bhavan Road, Hyderabad - 500082",
      phone: "+91 40 6678 9200",
      email: "north@srilakshmichits.com",
      manager: "M. Rajeshwar Rao",
      licenseNo: "TS-CHIT-REG-2020/559",
      activeSchemes: 6,
      totalSubscribers: 125,
      monthlyTurnover: "₹14,00,000",
      status: "Active",
    },
  ])

  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Form State for new branch
  const [formName, setFormName] = useState("")
  const [formCode, setFormCode] = useState("")
  const [formManager, setFormManager] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formAddress, setFormAddress] = useState("")
  const [formLicense, setFormLicense] = useState("")

  const branchColumns: TableColumn<BranchDetail>[] = [
    {
      id: "code",
      header: "Branch Code",
      sortable: true,
      cell: (b) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted text-foreground">
          {b.code}
        </span>
      ),
    },
    {
      id: "name",
      header: "Branch Name & Location",
      sortable: true,
      cell: (b) => (
        <div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{b.name}</span>
          <span className="block text-[11px] text-muted-foreground line-clamp-1">{b.address}</span>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact Details",
      cell: (b) => (
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-mono">
            <SvglWhatsapp size={12} className="shrink-0" /> {b.phone}
          </div>
          <div className="flex items-center gap-1.5">
            <SvglGmail size={12} className="shrink-0" /> {b.email}
          </div>
        </div>
      ),
    },
    {
      id: "manager",
      header: "Foreperson",
      sortable: true,
      cell: (b) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200">{b.manager}</span>
          <span className="block text-[10px] text-muted-foreground font-mono">{b.licenseNo}</span>
        </div>
      ),
    },
    {
      id: "schemes",
      header: "Schemes / Members",
      cell: (b) => (
        <span className="text-xs font-semibold">
          {b.activeSchemes} Schemes · {b.totalSubscribers} Tickets
        </span>
      ),
    },
    {
      id: "monthlyTurnover",
      header: "Monthly Turnover",
      sortable: true,
      cell: (b) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {b.monthlyTurnover}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (b) => {
        const isCurrent = b.id === activeOrg.id || b.code === activeOrg.code
        return isCurrent ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full">
            <Check className="size-3" /> Active Now
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
            <ShieldCheck className="size-3" /> Operational
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "Workspace Action",
      className: "text-right",
      cell: (b) => {
        const isCurrent = b.id === activeOrg.id || b.code === activeOrg.code
        return isCurrent ? (
          <span className="text-xs text-muted-foreground font-medium italic">Connected</span>
        ) : (
          <button
            onClick={() => handleSwitchBranch(b)}
            className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:bg-indigo-950/50 dark:hover:bg-indigo-600 dark:hover:text-white rounded-lg transition-colors shadow-xs"
          >
            Switch
          </button>
        )
      },
    },
  ]

  const filteredBranches = branchList.filter((b) => {
    return (
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalSchemes = branchList.reduce((acc, b) => acc + b.activeSchemes, 0)
  const totalSubscribers = branchList.reduce((acc, b) => acc + b.totalSubscribers, 0)

  const handleSwitchBranch = (branch: BranchDetail) => {
    setActiveOrg({
      id: branch.id,
      name: branch.name,
      plan: branch.plan,
      code: branch.code,
      badge: branch.badge,
    })
    setToastMessage(`Switched active workspace branch to "${branch.name}" (${branch.code})`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName || !formCode) return

    const newBranch: BranchDetail = {
      id: `org-${Date.now()}`,
      name: formName,
      plan: "Standard Branch",
      code: formCode.toUpperCase(),
      badge: "Branch Office",
      address: formAddress || "Branch Address, Commercial Complex",
      phone: formPhone || "+91 98765 00000",
      email: `${formCode.toLowerCase()}@chitsfund.com`,
      manager: formManager || "Branch Foreperson",
      licenseNo: formLicense || `REG-${Date.now().toString().slice(-6)}`,
      activeSchemes: 1,
      totalSubscribers: 20,
      monthlyTurnover: "₹5,00,000",
      status: "Active",
    }

    setBranchList([...branchList, newBranch])
    setShowAddModal(false)
    setFormName("")
    setFormCode("")
    setFormManager("")
    setFormPhone("")
    setFormAddress("")
    setFormLicense("")
    setToastMessage(`Branch "${newBranch.name}" created and registered!`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <DashboardShell pageTitle="Branch Network">
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
          tag="Branch Network"
          title="Multi-Branch Chit Network"
          description="Manage authorized branch offices, foreperson licensing, and localized collection centers."
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 bg-muted rounded-lg border border-border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Table View (@7ovr/table-2)"
                >
                  <TableIcon className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "cards" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Cards View"
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="size-4" />
                <span>Add New Branch</span>
              </button>
            </div>
          }
          stats={[
            {
              label: "Active Branches",
              value: `${branchList.length} Offices`,
              delta: "Fully operational",
              deltaType: "positive",
            },
            {
              label: "Active Schemes",
              value: `${totalSchemes} Schemes`,
              delta: "Across all branches",
              deltaType: "neutral",
            },
            {
              label: "Enrolled Subscribers",
              value: `${totalSubscribers} Members`,
              delta: "Verified ROSCA tickets",
              deltaType: "positive",
            },
            {
              label: "Active Workspace",
              value: activeOrg.code,
              delta: "Connected Now",
              deltaType: "positive",
            },
          ]}
        />

        {/* Branches Content with @7ovr/table-2 design */}
        {viewMode === "table" ? (
          <DataTable2<BranchDetail>
            data={branchList}
            columns={branchColumns}
            getId={(b) => b.id}
            searchPlaceholder="Search branch name, code, manager, or address..."
            searchKey={(b) => `${b.name} ${b.code} ${b.manager} ${b.address} ${b.phone}`}
            pageSize={7}
            emptyMessage="No branches match the search criteria."
            bulkActions={{
              onDownload: (selected) => {
                alert(`Exporting directory report for ${selected.length} branch offices...`);
              },
              onSendReminder: (selected) => {
                alert(`Broadcasting circular to ${selected.length} branch managers...`);
              },
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBranches.map((branch) => {
              const isCurrent = branch.id === activeOrg.id || branch.code === activeOrg.code
              return (
                <div
                  key={branch.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                    isCurrent
                      ? "border-indigo-500/80 dark:border-indigo-500 ring-2 ring-indigo-500/10"
                      : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {branch.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {branch.code}
                          </span>
                          <span className="text-[10px] text-slate-400">{branch.badge}</span>
                        </div>
                      </div>

                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-full">
                          <Check className="size-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="size-3" />
                          <span>Operational</span>
                        </span>
                      )}
                    </div>

                    {/* Branch Details */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 my-4 border-y border-slate-100 dark:border-slate-800 py-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-relaxed line-clamp-2">{branch.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-mono">{branch.phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="size-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px]">{branch.email}</span>
                      </div>

                      <div className="pt-1 text-[11px]">
                        <span className="text-slate-400 font-medium">Foreperson: </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{branch.manager}</span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400">
                        License: {branch.licenseNo}
                      </div>
                    </div>

                    {/* Scheme & Turnover stats */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center mb-4 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">Schemes</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{branch.activeSchemes}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Members</p>
                        <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{branch.totalSubscribers}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Turnover/Mo</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{branch.monthlyTurnover}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Switch Action */}
                  <div>
                    {isCurrent ? (
                      <div className="w-full py-2 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900">
                        Currently Selected Branch
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSwitchBranch(branch)}
                        className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 dark:hover:text-white rounded-xl transition-colors shadow-xs"
                      >
                        Switch to This Branch
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal: Add New Branch */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="size-4 text-indigo-600" />
                  <span>Register New Branch Office</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddBranch} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Chits West Zone"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Branch Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. APX-WEST"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 44 2800 0000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Branch Manager / Foreperson
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R. Subramanian"
                    value={formManager}
                    onChange={(e) => setFormManager(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Office Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Area, City & PIN"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Chit Act License / Registration No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TN-CHIT-REG-2026/102"
                    value={formLicense}
                    onChange={(e) => setFormLicense(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    Register Branch
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
