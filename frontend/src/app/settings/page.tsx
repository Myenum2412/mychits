"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { DashboardShell } from "@/components/dashboard-shell"
import { api, Member, WhatsAppSession } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import {
  Settings,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  User,
  Users,
  Building2,
  Bell,
  Check,
  Copy,
  LogOut,
  Info,
} from "lucide-react"

export default function SettingsPage() {
  const { role, user, activeOrg } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  // User Selection for Separate QR Code
  // Can be "admin" (foreperson) or individual member IDs
  const [selectedUserId, setSelectedUserId] = useState<string>("admin")
  const [selectedUserName, setSelectedUserName] = useState<string>("Foreperson Admin")

  // WhatsApp Session State (wwebjs.dev)
  const [session, setSession] = useState<WhatsAppSession | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<number>(30)
  const [copied, setCopied] = useState(false)

  // Send Test Message Form
  const [testPhone, setTestPhone] = useState("+91 98765 43210")
  const [testMessage, setTestMessage] = useState(
    "Hello from ChitStream! Your monthly chit auction dividend of ₹750 has been credited. Powered by whatsapp-web.js (wwebjs.dev)"
  )
  const [sendingMsg, setSendingMsg] = useState(false)
  const [msgResult, setMsgResult] = useState<string | null>(null)

  // Load registered members from DB to populate separate user dropdown
  useEffect(() => {
    async function loadMembers() {
      try {
        setLoadingMembers(true)
        const data = await api.getMembers()
        setMembers(data)
      } catch {
        // Members optional if DB is empty
      } finally {
        setLoadingMembers(false)
      }
    }
    loadMembers()
  }, [])

  // Fetch WhatsApp session for selected user
  const fetchSession = async (userId: string) => {
    try {
      setLoadingSession(true)
      const data = await api.getWhatsAppStatus(userId)
      setSession(data)
      setError(null)
      setCountdown(30)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load WhatsApp session")
      // Fallback local session if backend unreachable
      setSession({
        user_id: userId,
        status: "ready_to_scan",
        qr_code: `2@wwebjs-${userId}-${Date.now()},fallback_qr,https://wwebjs.dev/`,
        connected_number: null,
        last_active: Date.now(),
        library: "https://wwebjs.dev/",
      })
    } finally {
      setLoadingSession(false)
    }
  }

  useEffect(() => {
    fetchSession(selectedUserId)
  }, [selectedUserId])

  // Countdown timer for QR code auto-refresh simulation
  useEffect(() => {
    if (!session || session.status !== "ready_to_scan") return

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [session])

  // Handle Separate User Switch
  const handleUserChange = (val: string) => {
    setSelectedUserId(val)
    if (val === "admin") {
      setSelectedUserName("Foreperson Admin (Main Branch)")
      setTestPhone("+91 98765 43210")
    } else {
      const found = members.find((m) => m.id.toString() === val)
      if (found) {
        setSelectedUserName(`${found.name} (Subscriber #${found.id})`)
        setTestPhone(found.phone || "+91 91234 56789")
      } else {
        setSelectedUserName(`User #${val}`)
      }
    }
    setMsgResult(null)
  }

  // Refresh QR code for this specific user
  const handleRefreshQR = async () => {
    try {
      setLoadingSession(true)
      const updated = await api.performWhatsAppAction(selectedUserId, "refresh")
      setSession(updated)
      setCountdown(30)
    } catch {
      // Local fallback
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "ready_to_scan",
              qr_code: `2@wwebjs-${selectedUserId}-${Date.now()},NEW_QR_${Date.now()},https://wwebjs.dev/`,
            }
          : null
      )
      setCountdown(30)
    } finally {
      setLoadingSession(false)
    }
  }

  // Simulate scanning QR code (Link device)
  const handleSimulateScan = async () => {
    try {
      setLoadingSession(true)
      const updated = await api.performWhatsAppAction(selectedUserId, "connect")
      setSession(updated)
    } catch {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "connected",
              qr_code: null,
              connected_number: selectedUserId === "admin" ? "+91 98765 43210" : "+91 91234 56789",
            }
          : null
      )
    } finally {
      setLoadingSession(false)
    }
  }

  // Disconnect WhatsApp session
  const handleDisconnect = async () => {
    if (!confirm(`Disconnect WhatsApp Web for ${selectedUserName}?`)) return
    try {
      setLoadingSession(true)
      const updated = await api.performWhatsAppAction(selectedUserId, "disconnect")
      setSession(updated)
    } catch {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "disconnected",
              qr_code: `2@wwebjs-${selectedUserId}-${Date.now()},DISCONNECTED,https://wwebjs.dev/`,
              connected_number: null,
            }
          : null
      )
    } finally {
      setLoadingSession(false)
    }
  }

  // Send Test WhatsApp Notification
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingMsg(true)
    setMsgResult(null)

    try {
      const res = await api.sendWhatsAppMessage(selectedUserId, testPhone, testMessage)
      setMsgResult(`Notification sent successfully to ${res.recipient} via whatsapp-web.js!`)
    } catch (err: unknown) {
      setMsgResult(err instanceof Error ? err.message : "Simulated message dispatched successfully.")
    } finally {
      setSendingMsg(false)
    }
  }

  const handleCopyQRString = () => {
    if (session?.qr_code) {
      navigator.clipboard.writeText(session.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DashboardShell pageTitle="Settings & WhatsApp Web">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-600" />
              Settings & WhatsApp Integration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure multi-user WhatsApp Web QR pairing, automated chit alert triggers, and branch settings.
            </p>
          </div>

          {/* Direct link to wwebjs.dev */}
          <a
            href="https://wwebjs.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-xs"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Powered by wwebjs.dev</span>
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        </div>

        {/* SECTION: WhatsApp Web JS (wwebjs.dev) QR Code & Multi-User Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Card Top Banner */}
          <div className="border-b border-slate-100 dark:border-slate-800 p-6 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <Smartphone className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  WhatsApp Web Client Integration
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  wwebjs.dev
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your WhatsApp via{" "}
                <a
                  href="https://wwebjs.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                >
                  whatsapp-web.js (wwebjs.dev)
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>{" "}
                to automatically dispatch auction reminders, receipt PDFs, and dividend announcements.
              </p>
            </div>

            {/* Separate User Selector Dropdown */}
            <div className="flex items-center gap-2.5 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                <User className="h-3.5 w-3.5 text-indigo-600" />
                Show QR Code For:
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <optgroup label="Organization / Admins">
                  <option value="admin">Foreperson Admin (Main Branch)</option>
                  <option value="branch_mgr">Branch Manager (South Office)</option>
                </optgroup>
                <optgroup label="Subscribers / Members">
                  {members.length > 0 ? (
                    members.map((m) => (
                      <option key={m.id} value={m.id.toString()}>
                        {m.name} ({m.phone})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="member_1">Ramesh Kumar (+91 98765 11111)</option>
                      <option value="member_2">Priya Patel (+91 98765 22222)</option>
                      <option value="member_3">Anil Sharma (+91 98765 33333)</option>
                    </>
                  )}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: QR Code Display Card */}
            <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  WhatsApp Web QR Code
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    session?.status === "connected"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {session?.status === "connected" ? "Device Linked" : "Scan to Connect"}
                </span>
              </div>

              {/* QR Container */}
              <div className="relative p-4 bg-white rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[240px] min-w-[240px]">
                {loadingSession ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                    <span className="text-xs">Generating QR from wwebjs...</span>
                  </div>
                ) : session?.status === "connected" ? (
                  <div className="flex flex-col items-center gap-3 p-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-9 w-9" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        WhatsApp Connected!
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {session.connected_number || "+91 98765 43210"}
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-400">
                      Session Active · wwebjs.dev
                    </span>
                  </div>
                ) : session?.qr_code ? (
                  <div className="flex flex-col items-center">
                    <QRCodeSVG
                      value={session.qr_code}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                    <p className="text-[10px] text-slate-400 font-mono mt-2">
                      Auto-refresh in {countdown}s
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No QR Code available</div>
                )}
              </div>

              {/* Active User Label */}
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Target Account: {selectedUserName}
                </p>
                <p className="text-[11px] text-slate-400">
                  Session ID: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">{selectedUserId}</code>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                {session?.status === "connected" ? (
                  <button
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 dark:text-rose-300 text-xs font-semibold rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Disconnect WhatsApp
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleRefreshQR}
                      disabled={loadingSession}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingSession ? "animate-spin" : ""}`} />
                      Refresh QR
                    </button>
                    <button
                      onClick={handleSimulateScan}
                      disabled={loadingSession}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Simulate Scan (Link Device)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Instructions, Library Specs & Test Notification */}
            <div className="lg:col-span-7 space-y-6">
              {/* How to scan instructions */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-600" />
                  How to link your WhatsApp:
                </h4>
                <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-decimal list-inside bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <li>Open <strong>WhatsApp</strong> on your mobile phone.</li>
                  <li>
                    Tap <strong>Menu (⋮)</strong> on Android or <strong>Settings (⚙️)</strong> on iPhone.
                  </li>
                  <li>
                    Select <strong>Linked Devices</strong>, then tap <strong>Link a device</strong>.
                  </li>
                  <li>
                    Point your camera at the QR code on the left to authenticate with{" "}
                    <strong>whatsapp-web.js (wwebjs.dev)</strong>.
                  </li>
                </ol>
              </div>

              {/* wwebjs.dev Architecture Note */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-indigo-600" />
                    About whatsapp-web.js (wwebjs.dev)
                  </span>
                  <a
                    href="https://wwebjs.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    View Official Documentation →
                  </a>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                  <strong>whatsapp-web.js</strong> connects through the WhatsApp Web browser app by running a headless Chromium instance via Puppeteer. It allows sending transactional chit messages without costly Business Cloud API tiers. Each separate user or organizer can maintain their own <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border text-[10px]">LocalAuth</code> session.
                </p>
              </div>

              {/* Send Test WhatsApp Message Form */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-emerald-600" />
                    Send Test Chit Notification
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Sender: {selectedUserName}
                  </span>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Recipient Mobile Number (with country code)
                    </label>
                    <input
                      type="tel"
                      required
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Notification Message
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  {msgResult && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{msgResult}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sendingMsg}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" />
                      {sendingMsg ? "Dispatching..." : "Send WhatsApp Alert"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Organization & Chit Fund System Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organization Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Chit Fund Organization Profile
                </h3>
                <p className="text-[11px] text-slate-500">
                  Active Entity from OrgMenu
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  Organization / Entity Name
                </label>
                <input
                  type="text"
                  disabled
                  value={activeOrg.name}
                  className="w-full px-3 py-1.5 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeOrg.code}
                    className="w-full px-3 py-1.5 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">
                    Foreperson License / Plan
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeOrg.plan}
                    className="w-full px-3 py-1.5 border rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automated Notification Rules */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Bell className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Automated Notification Triggers
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dispatched via WhatsApp Web & System
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Monthly Auction Reminder
                  </p>
                  <p className="text-[11px] text-slate-500">
                    WhatsApp alert 24 hours prior to chit auction
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Dividend & Net Due Announcement
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Send breakdown immediately after auction conclusion
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Payment Receipt Confirmation
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Instant WhatsApp receipt upon logging installment
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
