"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  LayersIcon,
  UsersIcon,
  GavelIcon,
  ReceiptIcon,
  Settings2Icon,
  GiftIcon,
  CreditCardIcon,
  Building2Icon,
  MegaphoneIcon,
  MessageSquareIcon,
  QrCodeIcon,
} from "lucide-react"

import { NavMain, NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { SvglUpi } from "@/components/ui/svgl-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/auth-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { role, user } = useAuth()
  const pathname = usePathname()
  const isSettingsActive = pathname.startsWith("/settings")

  // Navigation for OrgMenu (Admin)
  const orgMenuNav: NavItem[] = [
    {
      title: "Dashboard Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="size-5" />,
    },
    {
      title: "Chit Schemes & Groups",
      url: "/groups",
      icon: <LayersIcon className="size-5" />,
      items: [
        { title: "All Active Schemes", url: "/groups" },
        { title: "Create New Scheme", url: "/groups" },
      ],
    },
    {
      title: "Subscribers Registry",
      url: "/members",
      icon: <UsersIcon className="size-5" />,
    },
    {
      title: "Auctions & Bidding",
      url: "/auctions",
      icon: <GavelIcon className="size-5" />,
    },
    {
      title: "Collections & Receipts",
      url: "/payments",
      icon: <ReceiptIcon className="size-5" />,
    },
    {
      title: "YouPI Gateway Admin",
      url: "/gateway-admin",
      icon: <SvglUpi size={24} className="h-4 w-auto inline shrink-0" />,
    },
    {
      title: "Billing & Invoices",
      url: "/billing",
      icon: <CreditCardIcon className="size-5" />,
    },
    {
      title: "Branch Offices",
      url: "/branches",
      icon: <Building2Icon className="size-5" />,
    },
    {
      title: "Announcements",
      url: "/announcements",
      icon: <MegaphoneIcon className="size-5" />,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: <MessageSquareIcon className="size-5" />,
    },
  ]

  // Navigation for Chits role: Dashboard, Customers, Plans, Billing, Branches, Announcements, Rewards
  const chitsNav: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="size-5" />,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: <UsersIcon className="size-5" />,
    },
    {
      title: "Plans",
      url: "/plans",
      icon: <LayersIcon className="size-5" />,
    },
    {
      title: "Billing",
      url: "/billing",
      icon: <CreditCardIcon className="size-5" />,
    },
    {
      title: "Payments & YouPI Pay",
      url: "/payments",
      icon: <SvglUpi size={24} className="h-4 w-auto inline shrink-0" />,
    },
    {
      title: "Branches",
      url: "/branches",
      icon: <Building2Icon className="size-5" />,
    },
    {
      title: "Announcements",
      url: "/announcements",
      icon: <MegaphoneIcon className="size-5" />,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: <MessageSquareIcon className="size-5" />,
    },
    {
      title: "Rewards",
      url: "/rewards",
      icon: <GiftIcon className="size-5" />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* OrgMenu (TeamSwitcher) */}
        <TeamSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <NavMain
          items={role === "orgmenu" ? orgMenuNav : chitsNav}
          label={role === "orgmenu" ? "Admin Controls" : undefined}
        />
      </SidebarContent>

      <SidebarFooter className="p-2 gap-1.5">
        {/* Pinned Down Settings Navigation */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={isSettingsActive}
              className="h-11 px-3 rounded-xl transition-all"
              render={
                <Link
                  href="/settings"
                  className={`flex items-center gap-3.5 font-medium transition-colors ${
                    isSettingsActive
                      ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/50"
                      : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                  }`}
                />
              }
            >
              <Settings2Icon className="size-5 shrink-0" />
              <span className="text-[15px] tracking-tight font-medium group-data-[collapsible=icon]:hidden">
                Settings
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-0.5" />

        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
