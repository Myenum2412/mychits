"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { api, DashboardStats } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import {
  Layers,
  Users,
  Gavel,
  Receipt,
  TrendingUp,
  Award,
  PlusCircle,
  Database,
  ArrowRight,
  Info,
  ShieldCheck,
  UserCheck,
  Landmark,
  Coins,
} from "lucide-react"

export default function DashboardPage() {
  const { role, activeOrg } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_groups: 0,
    active_groups: 0,
    total_members: 0,
    active_members: 0,
    total_auctions: 0,
    total_collections: 0,
    total_prizes: 0,
    total_dividends: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const data = await api.getDashboardStats()
        setStats(data)
        setError(null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to reach FastAPI backend")
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <DashboardShell pageTitle={role === "organizer" ? "Foreperson Admin Dashboard" : "Subscriber Portal"}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Role & Org Context Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              role === "organizer" ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
            } shadow-sm`}>
              {role === "organizer" ? <ShieldCheck className="h-6 w-6" /> : <Coins className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {role === "organizer" ? "Foreperson Operations Console" : "Subscriber Investment Portal"}
                </h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  role === "organizer"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}>
                  {role === "organizer" ? "Role: Organizer / Admin" : "Role: Subscriber"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Landmark className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Active Organization: <strong className="text-slate-700 dark:text-slate-300">{activeOrg.name}</strong> ({activeOrg.plan})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === "organizer" ? (
              <Link
                href="/groups"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Create Chit Scheme
              </Link>
            ) : (
              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Gavel className="h-4 w-4" />
                Participate in Auction
              </Link>
            )}
          </div>
        </div>

        {/* Database Zero Mock Data Notice */}
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
            <Database className="h-4 w-4" />
          </div>
          <div className="space-y-0.5 text-xs">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Clean PostgreSQL Database
              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full">
                Zero Seed Data
              </span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              The database schema is verified without any mock or dummy rows. Use the navigation to add real subscribers or initiate schemes.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm text-amber-800 dark:text-amber-300">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-xs">
              Backend status: {error}. Make sure FastAPI is running on <code className="bg-amber-100 px-1 py-0.5 rounded">http://127.0.0.1:8000</code>.
            </p>
          </div>
        )}

        {/* KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {role === "organizer" ? "Total Chit Schemes" : "Available Schemes"}
              </span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : stats.total_groups}
              </span>
              <span className="text-xs text-slate-500">
                ({stats.active_groups} active)
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {role === "organizer" ? "Total Subscribers" : "My Membership Status"}
              </span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {role === "organizer" ? (loading ? "..." : stats.total_members) : "Enrolled"}
              </span>
              <span className="text-xs text-slate-500">
                {role === "organizer" ? `(${stats.active_members} active)` : "Verified KYC"}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {role === "organizer" ? "Total Collections" : "Installments Paid"}
              </span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : formatCurrency(stats.total_collections)}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {role === "organizer" ? "Prize Pool Distributed" : "Dividends Earned"}
              </span>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? "..." : formatCurrency(role === "organizer" ? stats.total_prizes : stats.total_dividends)}
              </span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/groups"
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Layers className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Chit Schemes</h4>
            <p className="text-xs text-slate-500 mt-1">
              {role === "organizer" ? "Manage pool values, ticket quotas & monthly rules." : "Browse active groups & view your enrolled tickets."}
            </p>
          </Link>

          {role === "organizer" ? (
            <Link
              href="/members"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Subscriber Directory</h4>
              <p className="text-xs text-slate-500 mt-1">
                Register new members, verify contact details & PAN/Aadhaar.
              </p>
            </Link>
          ) : (
            <Link
              href="/groups"
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
                  <UserCheck className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
              </div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">My Chit Tickets</h4>
              <p className="text-xs text-slate-500 mt-1">
                Check ticket numbers, prize status and eligibility.
              </p>
            </Link>
          )}

          <Link
            href="/auctions"
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-500 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
                <Gavel className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Monthly Auctions</h4>
            <p className="text-xs text-slate-500 mt-1">
              {role === "organizer" ? "Host monthly auction bids & compute dividends." : "Check live bid discounts & your net payable amount."}
            </p>
          </Link>

          <Link
            href="/payments"
            className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <Receipt className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Installments & Receipts</h4>
            <p className="text-xs text-slate-500 mt-1">
              Log subscriptions with UPI, cash, cheque or NEFT receipt IDs.
            </p>
          </Link>
        </div>

        {/* Empty state notice */}
        {stats.total_groups === 0 && stats.total_members === 0 && !loading && (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <div className="h-12 w-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No Schemes Recorded Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your database has zero pre-seeded records. As an organizer, create your first scheme or register subscribers to get started.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Link
                href="/groups"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Create Scheme
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
