"use client"

import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { CoinsIcon, ShieldCheckIcon, TrendingUpIcon, AwardIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-slate-100">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <CoinsIcon className="size-4" />
            </div>
            <span className="tracking-tight text-base font-bold">ChitStream</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>

      <div className="relative hidden bg-slate-900 lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            PostgreSQL & FastAPI Powered
          </span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Transparent, compliant Chit Fund management for modern organizers & subscribers.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage scheme enrollments, conduct automated dividend auctions, collect installments, and give members real-time access to their investment returns.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <ShieldCheckIcon className="size-5 text-indigo-400 mb-1.5" />
              <p className="text-xs font-semibold">Foreperson Controls</p>
              <p className="text-[11px] text-slate-400">Complete compliance & ticket allocations</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <AwardIcon className="size-5 text-emerald-400 mb-1.5" />
              <p className="text-xs font-semibold">Automated Auctions</p>
              <p className="text-[11px] text-slate-400">Live dividend & net installment math</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          © 2026 ChitStream Financial Technologies.
        </div>
      </div>
    </div>
  )
}
