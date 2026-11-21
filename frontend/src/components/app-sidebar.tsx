"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  LayersIcon,
  UsersIcon,
  GavelIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  UserIcon,
  Building2Icon,
  CoinsIcon,
  Settings2Icon,
} from "lucide-react"

import { NavMain, NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { useAuth, UserRole } from "@/context/auth-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role, setRole, user, activeOrg } = useAuth()

  // Dynamic Navigation depending on active role
  const organizerNav: NavItem[] = [
    {
      title: "Dashboard Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="size-4" />,
    },
    {
      title: "Chit Schemes & Groups",
      url: "/groups",
      icon: <LayersIcon className="size-4" />,
      items: [
        { title: "All Active Schemes", url: "/groups" },
        { title: "Create New Scheme", url: "/groups" },
      ],
    },
    {
      title: "Subscribers Registry",
      url: "/members",
      icon: <UsersIcon className="size-4" />,
    },
    {
      title: "Auctions & Bidding",
      url: "/auctions",
      icon: <GavelIcon className="size-4" />,
    },
    {
      title: "Collections & Receipts",
      url: "/payments",
      icon: <ReceiptIcon className="size-4" />,
    },
    {
      title: "Settings & WhatsApp",
      url: "/settings",
      icon: <Settings2Icon className="size-4" />,
    },
  ]

  const subscriberNav: NavItem[] = [
    {
      title: "My Chits Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="size-4" />,
    },
    {
      title: "My Enrolled Groups",
      url: "/groups",
      icon: <LayersIcon className="size-4" />,
    },
    {
      title: "Monthly Auctions",
      url: "/auctions",
      icon: <GavelIcon className="size-4" />,
    },
    {
      title: "My Payments & Receipts",
      url: "/payments",
      icon: <ReceiptIcon className="size-4" />,
    },
    {
      title: "Settings & WhatsApp",
      url: "/settings",
      icon: <Settings2Icon className="size-4" />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="space-y-2">
        {/* OrgMenu (TeamSwitcher) */}
        <TeamSwitcher />

        {/* 2 User Roles Switcher Bar */}
        <div className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            {role === "organizer" ? (
              <ShieldCheckIcon className="size-3.5 text-indigo-600" />
            ) : (
              <UserIcon className="size-3.5 text-emerald-600" />
            )}
            <span className="text-[11px] font-semibold">
              {role === "organizer" ? "Foreperson / Admin" : "Subscriber"}
            </span>
          </div>
          <button
            onClick={() => setRole(role === "organizer" ? "subscriber" : "organizer")}
            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 shadow-xs border border-slate-200 dark:border-slate-600 transition-colors"
          >
            Switch
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={role === "organizer" ? organizerNav : subscriberNav}
          label={role === "organizer" ? "Admin Controls" : "Subscriber Portal"}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
