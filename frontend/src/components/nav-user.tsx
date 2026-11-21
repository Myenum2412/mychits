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
  ShieldCheckIcon,
  UserCheckIcon,
  LogOutIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react"
import { useAuth, UserRole } from "@/context/auth-context"

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
  const { user, role, setRole, logout } = useAuth()
  const router = useRouter()

  const handleToggleRole = () => {
    const nextRole: UserRole = role === "organizer" ? "subscriber" : "organizer"
    setRole(nextRole)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-indigo-100 text-indigo-700 font-bold">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-xs text-slate-900 dark:text-slate-100">
                {user.name}
              </span>
              <span className="truncate text-[11px] font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                {role === "organizer" ? "Foreperson / Admin" : "Chit Subscriber"}
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
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase text-slate-400 px-2 py-1">
                Active User Role
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleToggleRole}
                className="gap-2 text-xs cursor-pointer bg-slate-50 dark:bg-slate-800/60 font-medium"
              >
                <RotateCcwIcon className="size-3.5 text-indigo-600" />
                <span>Switch to {role === "organizer" ? "Subscriber View" : "Organizer View"}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-xs text-rose-600 cursor-pointer">
                <LogOutIcon className="size-3.5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
