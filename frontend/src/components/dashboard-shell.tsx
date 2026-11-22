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
import { useAuth, PREDEFINED_USERS } from "@/context/auth-context"
import { ShieldCheckIcon, CoinsIcon, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export function DashboardShell({
  children,
  pageTitle,
}: {
  children: React.ReactNode
  pageTitle?: string
}) {
  const { role, activeOrg } = useAuth()
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
    if (pathname.includes("announcement")) return "Announcements"
    if (pathname.includes("gateway-admin") || pathname.includes("youpi")) return "YouPI Gateway Admin"
    if (pathname.includes("messages")) return "Messages & Social Inbox"
    if (pathname.includes("billing")) return "Billing"
    if (pathname.includes("branches")) return "Branches"
    if (pathname.includes("plans") || pathname.includes("groups")) return "Chit Plans"
    if (pathname.includes("customers") || pathname.includes("members")) return "Customers"
    if (pathname.includes("rewards")) return "Rewards"
    if (pathname.includes("auctions")) return "Monthly Auctions"
    if (pathname.includes("payments")) return "Collections & Receipts"
    if (pathname.includes("settings")) return "Settings"
    return "Dashboard"
  }

  const roleInfo = PREDEFINED_USERS[role]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-full flex-1 flex flex-col min-h-screen">
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

          {/* Right Header: Active Role Badge & Backend Connection Indicator */}
          <div className="flex items-center gap-3">
            {/* Active Role Indicator Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium">
              {role === "orgmenu" ? (
                <ShieldCheckIcon className="size-3.5 text-indigo-600" />
              ) : (
                <CoinsIcon className="size-3.5 text-emerald-600" />
              )}
              <span className="text-slate-700 dark:text-slate-300">
                {roleInfo.roleLabel} ({roleInfo.roleBadge})
              </span>
            </div>

            {/* Backend health status badge */}
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              {backendStatus === "checking" && (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                  <span className="text-slate-500 hidden md:inline">FastAPI Checking...</span>
                </>
              )}
              {backendStatus === "online" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-700 dark:text-emerald-400 hidden md:inline">FastAPI Online</span>
                </>
              )}
              {backendStatus === "offline" && (
                <>
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-700 dark:text-amber-400 hidden md:inline">FastAPI Offline</span>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col w-full p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-950/50 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
