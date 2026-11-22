"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({
  items,
  label,
}: {
  items: NavItem[]
  label?: string
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {label ? (
        <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-3">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0
          const isCurrent = pathname === item.url || (hasChildren && item.items?.some((sub) => sub.url === pathname))

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isCurrent}
                  className="h-11 px-3 rounded-xl transition-all"
                  render={
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3.5 font-medium transition-colors ${
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/50"
                          : "text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    />
                  }
                >
                  {item.icon}
                  <span className="text-[15px] tracking-tight">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <Collapsible
              key={item.title}
              defaultOpen={item.isActive || isCurrent}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="h-11 px-3 rounded-xl transition-all"
                  />
                }
              >
                {item.icon}
                <span className="text-[15px] tracking-tight font-medium">{item.title}</span>
                <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="my-1 ml-4 border-l border-slate-200 dark:border-slate-800 pl-2 space-y-1">
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        className="h-9 px-3 rounded-lg text-sm"
                        render={
                          <Link
                            href={subItem.url}
                            className={`text-[13.5px] ${pathname === subItem.url ? "text-indigo-600 font-bold" : "text-slate-600 dark:text-slate-400"}`}
                          />
                        }
                      >
                        <span>{subItem.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
