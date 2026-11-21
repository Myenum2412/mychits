"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, PlusIcon, LandmarkIcon, Building2Icon, CheckIcon } from "lucide-react"
import { useAuth, Organization } from "@/context/auth-context"

export function TeamSwitcher({
  teams,
}: {
  teams?: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const { organizations, activeOrg, setActiveOrg } = useAuth()
  const [showAddPrompt, setShowAddPrompt] = React.useState(false)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <LandmarkIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {activeOrg.name}
              </span>
              <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {activeOrg.plan}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 p-1"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1.5">
                Chit Fund Organizations & Branches
              </DropdownMenuLabel>
              {organizations.map((org, index) => {
                const isSelected = org.id === activeOrg.id
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setActiveOrg(org)}
                    className="gap-2.5 p-2 rounded-lg cursor-pointer"
                  >
                    <div className={`flex size-7 items-center justify-center rounded-md border ${
                      isSelected ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400" : "bg-muted text-muted-foreground"
                    }`}>
                      <Building2Icon className="size-3.5" />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-medium text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="truncate">{org.name}</span>
                        {isSelected && <CheckIcon className="size-3 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {org.code} · {org.plan}
                      </div>
                    </div>
                    <DropdownMenuShortcut className="text-[10px]">⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  const branchName = prompt("Enter new Branch / Organization name:")
                  if (branchName) {
                    setActiveOrg({
                      id: `org-${Date.now()}`,
                      name: branchName,
                      plan: "Registered Chit Branch",
                      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
                      badge: "New Branch",
                    })
                  }
                }}
                className="gap-2 p-2 rounded-lg cursor-pointer text-xs"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent text-slate-500">
                  <PlusIcon className="size-3.5" />
                </div>
                <div className="font-medium text-slate-700 dark:text-slate-300">
                  Add branch / organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
