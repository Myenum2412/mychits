"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"
import { ShieldCheckIcon, UserIcon, LandmarkIcon, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export function DashboardShell({
  children,
  pageTitle,
}: {
  children: React.ReactNode
  pageTitle?: string
}) {
  const { role, setRole, activeOrg } = useAuth()
  const pathname = usePathname()
  const [backendStatus, setBackendStatus] = React.useState<"checking" | "online" | "offline">("checking")

  React.useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("http://127.0.0.1:8000/health", { cache: "no-store" })
        if (res.ok) setBackendStatus("online")
        else setBackendStatus("offline")
      } catch {
        setBackendStatus("offline")
      }
    }
    checkHealth()
  }, [])

  const getBreadcrumb = () => {
    if (pathname.includes("groups")) return "Chit Schemes & Groups"
    if (pathname.includes("members")) return "Subscriber Registry"
    if (pathname.includes("auctions")) return "Monthly Auctions"
    if (pathname.includes("payments")) return "Collections & Receipts"
    return "Dashboard"
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 text-slate-600 dark:text-slate-300" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-slate-500 hover:text-slate-900">
                    {activeOrg.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-slate-800 dark:text-slate-200">
                    {pageTitle || getBreadcrumb()}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right Header Status & Role Indicator */}
          <div className="flex items-center gap-3">
            {/* Active Role Pill Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setRole("organizer")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  role === "organizer"
                    ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ShieldCheckIcon className="size-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Organizer</span>
              </button>
              <button
                onClick={() => setRole("subscriber")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  role === "subscriber"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <UserIcon className="size-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Subscriber</span>
              </button>
            </div>

            {/* Backend health status badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              {backendStatus === "checking" && (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                  <span className="text-slate-500">FastAPI Checking...</span>
                </>
              )}
              {backendStatus === "online" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400">FastAPI Online</span>
                </>
              )}
              {backendStatus === "offline" && (
                <>
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-700 dark:text-amber-400">FastAPI Offline</span>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
