"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { useAuth } from "@/context/auth-context"
import { DataTable2, TableColumn } from "@/components/ui/data-table-2"
import { PageHeader6 } from "@/components/ui/page-header-6"
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Pin,
  Send,
  Download,
  AlertCircle,
  Tag,
  Share2,
  X,
  Bell,
  Sparkles,
  Gavel,
  Coins,
  ShieldAlert,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react"
import { SvglWhatsapp } from "@/components/ui/svgl-icons"

interface Announcement {
  id: string
  title: string
  category: "auctions" | "dividends" | "holidays" | "schemes" | "compliance"
  categoryLabel: string
  content: string
  targetGroup: string
  date: string
  author: string
  isPinned?: boolean
  priority: "normal" | "high" | "urgent"
  whatsappDispatched?: boolean
}

export default function AnnouncementsPage() {
  const { activeOrg, role } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showModal, setShowModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Announcements List
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "ann-1",
      title: "Monthly Auction Schedule for November 2026",
      category: "auctions",
      categoryLabel: "Auction Notice",
      content:
        "The 15th cycle monthly reverse auction for 'Apex Diamond 5 Lakhs (25M)' and 'Super Gold 1 Lakh (20M)' will take place this Saturday, Nov 28th at 11:30 AM IST. All eligible members can place proxy bids or attend at the HQ premises.",
      targetGroup: "Diamond 5L & Gold 1L Groups",
      date: "Nov 22, 2026",
      author: "Foreperson Office · APEX-HQ",
      isPinned: true,
      priority: "high",
      whatsappDispatched: true,
    },
    {
      id: "ann-2",
      title: "Dividend Declaration & Offset for Month #8",
      category: "dividends",
      categoryLabel: "Dividend Release",
      content:
        "Total bid discount of ₹42,500 has been successfully distributed equally among 25 ticket holders. Your next installment invoice will automatically reflect the ₹1,700 dividend reduction.",
      targetGroup: "All Active Chit Schemes",
      date: "Nov 20, 2026",
      author: "Accounts & Audit Dept",
      isPinned: true,
      priority: "normal",
      whatsappDispatched: true,
    },
    {
      id: "ann-3",
      title: "New Chit Scheme Launch: 'Platinum Prosperity 10 Lakhs'",
      category: "schemes",
      categoryLabel: "New Scheme",
      content:
        "Registrations are now open for our new 50-month ROSCA scheme with a ₹20,000 monthly contribution. 8 tickets remaining. Early subscribers receive zero processing fee & bonus dividend points.",
      targetGroup: "Open to All Verified Members",
      date: "Nov 18, 2026",
      author: "Branch Operations",
      priority: "normal",
      whatsappDispatched: true,
    },
    {
      id: "ann-4",
      title: "Banking & Branch Counter Holiday Notice",
      category: "holidays",
      categoryLabel: "Holiday Notice",
      content:
        "Our physical branch cash counters and office will remain closed on Tuesday, Dec 1st for state foundation day. Online UPI payments, digital receipts, and WhatsApp portal access will remain active 24/7.",
      targetGroup: "General Public & All Branches",
      date: "Nov 15, 2026",
      author: "HR & Administration",
      priority: "normal",
      whatsappDispatched: false,
    },
    {
      id: "ann-5",
      title: "Annual Chit Funds Act 1982 Compliance Audit Completed",
      category: "compliance",
      categoryLabel: "Chit Act Compliance",
      content:
        "Annual statutory audit and reserve deposit verification with the State Registrar of Chits has concluded successfully with 100% compliance certificates issued.",
      targetGroup: "All Registered Subscribers",
      date: "Nov 10, 2026",
      author: "Legal & Regulatory Compliance",
      priority: "normal",
      whatsappDispatched: false,
    },
  ])

  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // New Announcement form fields
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState<Announcement["category"]>("auctions")
  const [formTarget, setFormTarget] = useState("All Active Chit Schemes")
  const [formPriority, setFormPriority] = useState<Announcement["priority"]>("normal")
  const [formContent, setFormContent] = useState("")
  const [formBroadcast, setFormBroadcast] = useState(true)

  const announcementColumns: TableColumn<Announcement>[] = [
    {
      id: "category",
      header: "Category",
      sortable: true,
      cell: (item) => (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            item.category === "auctions"
              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
              : item.category === "dividends"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
              : item.category === "schemes"
              ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
              : item.category === "holidays"
              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
          }`}
        >
          {item.categoryLabel}
        </span>
      ),
    },
    {
      id: "title",
      header: "Headline & Content",
      sortable: true,
      cell: (item) => (
        <div className="max-w-md">
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {item.isPinned && <Pin className="size-3 text-indigo-600 fill-indigo-600" />}
            <span>{item.title}</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
            {item.content}
          </p>
        </div>
      ),
    },
    {
      id: "targetGroup",
      header: "Target Group",
      cell: (item) => (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {item.targetGroup}
        </span>
      ),
    },
    {
      id: "date",
      header: "Date Published",
      sortable: true,
      cell: (item) => (
        <div>
          <span className="font-mono text-xs text-muted-foreground">{item.date}</span>
          <span className="block text-[10px] text-muted-foreground/80">{item.author}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "WhatsApp",
      cell: (item) => (
        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1.5">
          <SvglWhatsapp size={13} className="shrink-0" />
          <span>Dispatched</span>
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleTogglePin(item.id)}
            className={`p-1.5 rounded-md border text-xs ${
              item.isPinned
                ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
            title={item.isPinned ? "Unpin" : "Pin"}
          >
            <Pin className="size-3" />
          </button>
          <button
            onClick={() => handleShareWhatsApp(item)}
            className="p-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs flex items-center justify-center"
            title="Share via WhatsApp"
          >
            <SvglWhatsapp size={13} />
          </button>
        </div>
      ),
    },
  ]

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.targetGroup.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCat
  })

  const handleTogglePin = (id: string) => {
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    )
  }

  const handleShareWhatsApp = (ann: Announcement) => {
    const text = `*Notice from ${activeOrg.name}*\n\n*${ann.title}*\n${ann.content}\n\nTarget: ${ann.targetGroup}\nDate: ${ann.date}`
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
    setToastMessage(`WhatsApp broadcast link generated for "${ann.title}"!`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle || !formContent) return

    const categoryLabels: Record<Announcement["category"], string> = {
      auctions: "Auction Notice",
      dividends: "Dividend Release",
      schemes: "New Scheme",
      holidays: "Holiday Notice",
      compliance: "Chit Act Compliance",
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: formTitle,
      category: formCategory,
      categoryLabel: categoryLabels[formCategory],
      content: formContent,
      targetGroup: formTarget || "All Active Chit Schemes",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: `${activeOrg.name} · Admin`,
      isPinned: false,
      priority: formPriority,
      whatsappDispatched: formBroadcast,
    }

    setAnnouncements([newAnn, ...announcements])
    setShowModal(false)
    setFormTitle("")
    setFormContent("")
    setToastMessage(
      formBroadcast
        ? `Announcement published and broadcast sent to subscribers via WhatsApp!`
        : `Announcement published successfully!`
    )
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <DashboardShell pageTitle="Announcements & Broadcasts">
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
          tag="Announcements & Broadcasts"
          title="Chit Fund Announcements & Circulars"
          description="Broadcast monthly auction dates, dividend offset calculations, scheme launches & banking schedules."
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
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
              >
                <Plus className="size-4" />
                <span>Post Announcement</span>
              </button>
            </div>
          }
          stats={[
            {
              label: "Total Notices",
              value: `${announcements.length} Published`,
              delta: "Active circulars",
              deltaType: "neutral",
            },
            {
              label: "Auction Notices",
              value: `${announcements.filter((a) => a.category === "auctions").length} Scheduled`,
              delta: "Upcoming bidding rounds",
              deltaType: "positive",
            },
            {
              label: "Dividends Disclosed",
              value: "₹42,500",
              delta: "Distributed this cycle",
              deltaType: "positive",
            },
            {
              label: "WhatsApp Broadcast",
              value: "98.4%",
              delta: "Receipt & alert delivery",
              deltaType: "positive",
            },
          ]}
        />

        {/* Announcements Content with @7ovr/table-2 design */}
        {viewMode === "table" ? (
          <DataTable2<Announcement>
            data={announcements}
            columns={announcementColumns}
            getId={(a) => a.id}
            searchPlaceholder="Search notices by keyword, scheme, or title..."
            searchKey={(a) => `${a.title} ${a.content} ${a.targetGroup}`}
            pageSize={7}
            emptyMessage="No circulars or announcements found."
            filterSlot={
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All Notices" },
                  { id: "auctions", label: "Auctions" },
                  { id: "dividends", label: "Dividends" },
                  { id: "schemes", label: "New Schemes" },
                  { id: "holidays", label: "Holidays" },
                  { id: "compliance", label: "Compliance" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all shrink-0 ${
                      categoryFilter === cat.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            }
            bulkActions={{
              onDownload: (selected) => {
                alert(`Exporting ${selected.length} circulars as PDF...`)
              },
              onSendReminder: (selected) => {
                alert(`Broadcasting ${selected.length} announcements via WhatsApp...`)
              },
            }}
          />
        ) : (
          <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 text-xs shadow-xs">
              No announcements match your search or filter.
            </div>
          ) : (
            filteredAnnouncements.map((item) => {
              const isAuction = item.category === "auctions"
              const isDividend = item.category === "dividends"
              const isScheme = item.category === "schemes"
              const isHoliday = item.category === "holidays"

              const badgeColor = isAuction
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                : isDividend
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                : isScheme
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800"
                : isHoliday
                ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"

              return (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all relative ${
                    item.isPinned
                      ? "border-indigo-400/70 dark:border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20"
                      : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {item.categoryLabel}
                      </span>

                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-full">
                          <Pin className="size-3" />
                          <span>Pinned Broadcast</span>
                        </span>
                      )}

                      {item.whatsappDispatched && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <SvglWhatsapp size={12} className="shrink-0" />
                          <span>WhatsApp Dispatched</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>{item.date}</span>
                      </span>
                      <span>·</span>
                      <span>{item.author}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Tag className="size-3 text-slate-400" />
                      <span>Applies to:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.targetGroup}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                          item.isPinned
                            ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Pin className="size-3" />
                        <span>{item.isPinned ? "Unpin" : "Pin"}</span>
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        <SvglWhatsapp size={13} className="shrink-0" />
                        <span>Share Notice</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        )}

        {/* Modal: Post Announcement */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Megaphone className="size-4 text-indigo-600" />
                  <span>Publish New Chit Fund Notice</span>
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Notice Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next Auction Scheduled for Group A-500 on Saturday"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="auctions">Monthly Auction</option>
                      <option value="dividends">Dividend Declaration</option>
                      <option value="schemes">New Scheme Launch</option>
                      <option value="holidays">Banking & Holiday Hours</option>
                      <option value="compliance">Chit Act & Legal</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Audience / Group
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All Subscribers or Gold Scheme"
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Announcement Message Body *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type the full circular text, auction timing, dividend calculations, or branch instructions here..."
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="broadcastWhatsApp"
                    checked={formBroadcast}
                    onChange={(e) => setFormBroadcast(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="broadcastWhatsApp" className="text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer">
                    Simultaneously dispatch via WhatsApp broadcast to all member numbers
                  </label>
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
                    Publish Circular
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
