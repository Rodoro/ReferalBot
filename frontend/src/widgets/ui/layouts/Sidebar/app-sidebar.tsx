"use client"

import * as React from "react"
import { NavMain } from "@/widgets/ui/layouts/Sidebar/nav-main"
import { NavProjects } from "@/widgets/ui/layouts/Sidebar/nav-projects"
import { NavUser } from "@/widgets/ui/layouts/Sidebar/nav-user"
import { TeamSwitcher } from "@/widgets/ui/layouts/Sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/ui/layout/sidebar"
import { NavSecondary } from "./nav-secondary"
import { usePathname } from "next/navigation"
import { appSidebarContent, commonSidebarContent } from "@/widgets/content/sidebar-content"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const activeTeam = appSidebarContent.teams.find(team =>
    pathname.startsWith(team.url)
  ) ?? appSidebarContent.teams[0]

  const teamContent = activeTeam.content

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={appSidebarContent.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={teamContent.navMain} />
        <NavProjects projects={teamContent.projects} />
        <NavSecondary items={commonSidebarContent.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}