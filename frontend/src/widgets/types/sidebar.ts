import type { LucideIcon } from "lucide-react"
import { JSX } from "react"

export interface NavItem {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: Array<{
        title: string
        url: string
    }>
}

export interface ProjectItem {
    name: string
    url: string
    icon: JSX.Element
}

export interface TeamContent {
    navMain: NavItem[]
    projects: ProjectItem[]
}

export interface Team {
    name: string
    logo: LucideIcon
    plan: string
    url: string
    content: TeamContent
}