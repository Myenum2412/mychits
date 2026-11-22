"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  ShieldCheckIcon,
  CoinsIcon,
  Settings2Icon,
} from "lucide-react"
import { useAuth, PREDEFINED_USERS } from "@/context/auth-context"

export function NavUser({
  user: initialUser,
}: {
  user?: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { user, role, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const roleInfo = PREDEFINED_USERS[role]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="h-13 p-2.5 aria-expanded:bg-muted rounded-xl" />
            }
          >
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-bold text-sm text-slate-900 dark:text-slate-100">
                {user.name}
              </span>
              <span className="truncate text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {roleInfo.roleLabel} ({roleInfo.roleBadge})
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                className="gap-2 text-xs cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <Settings2Icon className="size-3.5 text-slate-500" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <div className="px-2 py-1 text-xs text-slate-500 flex items-center gap-1.5">
                {role === "orgmenu" ? (
                  <ShieldCheckIcon className="size-3.5 text-indigo-600" />
                ) : (
                  <CoinsIcon className="size-3.5 text-emerald-600" />
                )}
                <span>Role: <strong>{roleInfo.roleLabel} ({roleInfo.roleBadge})</strong></span>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-xs text-rose-600 cursor-pointer">
                <LogOutIcon className="size-3.5" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
