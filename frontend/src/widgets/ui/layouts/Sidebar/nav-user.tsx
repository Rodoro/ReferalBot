"use client"

import {
  // BadgeCheck,
  // Bell,
  ChevronsUpDown,
  LogOut,
  // Settings
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  // AvatarImage,
} from "@/shared/ui/branding/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/form/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/layout/sidebar"
// import { useLogout } from "@/entites/Auth/lib/hooks/useLogout"
// import Link from "next/link"
// import { getMediaSource } from "@/shared/lib/utils/get-media-source"
// import { useCurrentStaff } from "@/entites/Staff/lib/hooks/useCurrentStaff"

export function NavUser() {
  const { isMobile } = useSidebar()
  // const logout = useLogout()
  // const { staff } = useCurrentStaff()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {/* <AvatarImage src={getMediaSource(staff?.avatar)} alt={staff?.email} /> */}
                <AvatarFallback className="rounded-lg bg-blue-400 text-white">Д</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {/* <span className="truncate font-medium">{staff?.displayName}</span>
                <span className="truncate text-xs">{staff?.email}</span> */}
                <span className="truncate font-medium">Даня</span>
                <span className="truncate text-xs">@danya213411</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={getMediaSource(staff?.avatar)} alt={staff?.email} /> */}
                  <AvatarFallback className="rounded-lg bg-blue-400 text-white">Д</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {/* <span className="truncate font-medium">{staff?.displayName}</span>
                <span className="truncate text-xs">{staff?.email}</span> */}
                  <span className="truncate font-medium">Даня</span>
                  <span className="truncate text-xs">@danya213411</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href={"/settings/account"} className='flex w-full items-center gap-2'>
                  <BadgeCheck />
                  Акаунт
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/settings"} className='flex w-full items-center gap-2'>
                  <Settings />
                  Настройки
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={"/settings/notifications"} className='flex w-full items-center gap-2'>
                  <Bell />
                  Уведомления
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem onClick={() => logout()} className="cursor-pointer"> */}
            <DropdownMenuItem className="cursor-pointer">
              <LogOut />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
