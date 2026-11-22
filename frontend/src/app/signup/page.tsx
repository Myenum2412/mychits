"use client"

import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import {
  CoinsIcon,
  ReceiptIcon,
  CheckCircle2Icon,
  BadgePercentIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react"
import {
  SvglNextjs,
  SvglFastapi,
  SvglPython,
  SvglTailwindcss,
} from "@/components/ui/svgl-icons"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Left side: Clean Registration Form (50% equal split) */}
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
          <SignupForm />
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
            <span>Digital Chit Collection Network</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Account Registration</span>
        </div>

        {/* Core Showcase Body */}
        <div className="relative z-10 max-w-xl my-auto space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-100">
              Start collecting monthly chit installments with zero paperwork.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              Whether you are an administrative organizer managing multiple chit schemes or an enrolled subscriber paying monthly installments, ChitStream automates your collections and digital receipts.
            </p>
          </div>

          {/* Quick Feature Pillars (Oil-UI space-over-lines approach) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <ReceiptIcon className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Monthly Invoicing</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log UPI, cash, or bank transfers with unique serial vouchers and instant WhatsApp delivery.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <BadgePercentIcon className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Dividend Offsets</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Auction discounts automatically offset subscriber monthly dues, showing net amounts payable.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <UsersIcon className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Customer Registry</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete KYC directory with phone number, ticket allocation, and individual payment history.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <ShieldCheckIcon className="size-4" />
                </div>
                <h4 className="font-bold text-sm text-white">Database Security</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Salted PBKDF2 credentials stored directly in your PostgreSQL / SQLite database with zero hardcoded secrets.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-900">
          <span>Chit Fund Collection Engine</span>
          <span>Instant Setup</span>
        </div>
      </div>
    </div>
  )
}
