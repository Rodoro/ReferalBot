"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
    url: string
  }[]
}) {
  const pathname = usePathname()

  const activeTeam = React.useMemo(() => {
    return teams.find(team => pathname.startsWith(team.url)) || teams[0]
  }, [teams, pathname])

  if (!activeTeam) {
    return null
  }

  return (
    <div className="group flex w-full items-center gap-2 pt-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted/50">
      <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <activeTeam.logo className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{activeTeam.name}</span>
        <span className="truncate text-xs text-muted-foreground">{activeTeam.plan}</span>
      </div>
    </div>
  )
}