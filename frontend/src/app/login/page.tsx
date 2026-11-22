"use client"

import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import {
  CoinsIcon,
  ReceiptIcon,
  CheckCircle2Icon,
  BadgePercentIcon,
  SendIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react"
import {
  SvglNextjs,
  SvglFastapi,
  SvglPython,
  SvglTailwindcss,
} from "@/components/ui/svgl-icons"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Left side: Clean, focused authentication form (50% equal split) */}
      <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-r border-slate-200/80 dark:border-slate-800/80">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100 group">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <CoinsIcon className="size-5" />
            </div>
            <div>
              <span className="tracking-tight text-base font-bold block leading-tight">ChitStream</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Monthly Payments</span>
            </div>
          </Link>
        </div>

        <div className="my-auto py-8 max-w-sm w-full mx-auto">
          <LoginForm />
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-900">
          <span>© 2026 ChitStream</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <SvglFastapi size={13} title="FastAPI" />
            <SvglPython size={13} title="Python" />
            <SvglNextjs size={13} title="Next.js" />
            <SvglTailwindcss size={13} title="Tailwind CSS" />
            <span>FastAPI & Next.js</span>
          </div>
        </div>
      </div>

      {/* Right side: Oil-UI Elevated Monthly Collection Showcase (50% equal split) */}
      <div className="hidden lg:flex relative bg-slate-950 text-white flex-col justify-between p-12 lg:p-16 overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[32rem] h-[32rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[32rem] h-[32rem] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monthly Payment Collection System</span>
          </div>
          <span className="text-xs font-mono text-slate-400">v2.4 Production</span>
        </div>

        {/* Core Showcase Body */}
        <div className="relative z-10 max-w-xl my-auto space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-100">
              The automated monthly chit collection & digital ledger app.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Collect monthly installments across all your subscribers, compute automated auction dividend offsets, dispatch instant WhatsApp receipts, and reconcile collections without manual paperwork.
            </p>
          </div>

          {/* Interactive Live Collection Card (Oil-UI space-over-lines approach) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Collection Cycle</p>
                <p className="text-base font-bold text-white mt-0.5">Apex 20-Month Royal Chit (Group #A1)</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                  92.5% Collected
                </span>
              </div>
            </div>

            {/* Collection Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-400">Total Collected: <strong className="text-white">₹92,500</strong></span>
                <span className="text-slate-400">Target Pool: <strong className="text-white">₹1,00,000</strong></span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full w-[92.5%]" />
              </div>
            </div>

            {/* Live Collection Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Gross Due</p>
                <p className="text-sm font-bold text-slate-200 mt-1">₹5,000</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Per Ticket</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Dividend Offset</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">- ₹750</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Auction Gain</p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Net Collected</p>
                <p className="text-sm font-bold text-white mt-1">₹4,250</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Payable / Member</p>
              </div>
            </div>

            {/* WhatsApp Receipt Simulation Strip */}
            <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <SendIcon className="size-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-200">Instant WhatsApp Payment Receipt</p>
                  <p className="text-[11px] text-emerald-400/80">Auto-dispatched via whatsapp-web.js</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-900/60 px-2 py-0.5 rounded">SENT</span>
            </div>
          </div>

          {/* Feature Highlights Row */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2Icon className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">Zero Manual Calculations</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Dividends & foreman commission computed automatically each cycle.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheckIcon className="size-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">Bank-Grade Audit Trail</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Every UPI reference, cash voucher, and transaction ID permanently recorded.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-900">
          <span>Chit Fund Collection Engine</span>
          <span>Compliant Digital Passbook</span>
        </div>
      </div>
    </div>
  )
}
