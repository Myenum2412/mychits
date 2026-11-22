"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { PageHeader6 } from "@/components/ui/page-header-6"
import { useAuth } from "@/context/auth-context"
import {
  Gift,
  Award,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Coins,
  Copy,
  Check,
} from "lucide-react"
import { SvglWhatsapp } from "@/components/ui/svgl-icons"

export default function RewardsPage() {
  const { role, user } = useAuth()
  const [copied, setCopied] = useState(false)
  const referralCode = "CHIT-WIN-2026"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardShell pageTitle="Rewards & Benefits">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* Header Toolbar & KPI Grid using @7ovr/page-header-6 */}
        <PageHeader6
          tag="Rewards & Loyalty Tier"
          title="Subscriber Rewards & Benefits"
          description="Earn monthly auction dividend returns, prompt installment payment cashbacks, and referral bonuses on all your active chit plans."
          actions={
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-right shadow-xs">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Available Points</span>
                <span className="text-sm font-extrabold text-amber-500">1,250 pts</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied Code" : referralCode}</span>
              </button>
            </div>
          }
          stats={[
            {
              label: "Total Dividends Saved",
              value: "₹14,500",
              delta: "+12% vs last cycle",
              deltaType: "positive",
            },
            {
              label: "Payment Cashback",
              value: "₹1,850",
              delta: "100% on-time record",
              deltaType: "positive",
            },
            {
              label: "Referral Earnings",
              value: "₹2,500",
              delta: "5 members enrolled",
              deltaType: "positive",
            },
            {
              label: "Next Eligibility",
              value: "Month #4",
              delta: "Active Live Bidder",
              deltaType: "neutral",
            },
          ]}
        />

        {/* Rewards Programs & Referral Code */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Active Member Benefits
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Automatic Monthly Auction Dividend</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Active</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Whenever an auction closes with a bid discount, the surplus pool (minus foreman commission) is divided equally and deducted from your net monthly installment.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg shrink-0 mt-0.5">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Early Payment 1% Cashback</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Active</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pay your monthly chit installment via UPI, Net Banking or Auto-Debit on or before the 5th of each month to receive 1% direct reward points.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Zero Foreclosure Penalty</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200">Guaranteed</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Prized subscribers can settle remaining installments in advance without any hidden fees or pre-closure charges.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Invite & Earn</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">Refer Fellow Subscribers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Share your personal subscriber referral code with friends and family. Both you and your friend earn ₹500 in chit dividend credits upon scheme enrollment.
              </p>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-slate-100">
                  {referralCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Join ChitStream using my subscriber referral code: ${referralCode} to get ₹500 in chit dividend bonus!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <SvglWhatsapp size={20} className="shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">WhatsApp Invite Link</p>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Share your code directly with family & friends on WhatsApp
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
            </a>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
