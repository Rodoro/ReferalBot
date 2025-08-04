// content/sidebar-content.ts
import {
    Files,
    Settings,
    BarChart2,
    Music2,
    Bot,
    Gift,
    Users,
    Briefcase,
    PenLine,
    Video
} from "lucide-react"
import { Team, TeamContent } from "../types/sidebar"
import { FaBookBookmark, FaUserSecret } from "react-icons/fa6";
import { IoIosMusicalNotes } from "react-icons/io";
import { RoleType } from "@/entites/User/types/user.types";

// Меню над авой
export const commonSidebarContent = {
    navSecondary: [
        {
            title: "Рефиральный Bot",
            url: process.env.NEXT_PUBLIC_REFBOT || '',
            icon: Bot,
        },
        {
            title: "Подари песню Bot",
            url: "https://t.me/podaripesnyu_bot",
            icon: Gift,
        },
    ],
}

const adminchikContent: TeamContent = {
    navMain: [
        {
            title: "Администрирование",
            url: "/",
            icon: Settings,
            isActive: false,
            items: [
                { title: "Сотрудники", url: "/staff" },
                { title: "Консультанты", url: "/agent" },
                { title: "Партнёры", url: "/sales-point" },
                { title: "Точки продажи", url: "/sales-outlet" },
                { title: "Поэты", url: "/poets" },
                { title: "Видеомонтажеры", url: "/video-editors" },
                { title: "Пользователи", url: "/users" },
                { title: "Архитектура", url: "/architecture" },
            ],
        },
        {
            title: "Метрики",
            url: "/metrics",
            icon: BarChart2,
            isActive: true,
            items: [
                { title: "Статистика", url: "/metrics/statistics" },
                { title: "Выплаты", url: "/metrics/payouts" },
            ],
        },
        {
            title: "Файлы",
            url: "/files",
            icon: Files,
            isActive: false,
            items: [
                { title: "Баннеры", url: "/files/banners" },
                { title: "QR коды", url: "/files/qr-codes" },
                { title: "Договоры", url: "/files/сontracts" },
            ],
        },
    ],
    projects: [
        {
            name: "Консультант",
            url: process.env.NEXT_PUBLIC_REFBOT + "?start=secret_6A3C3FFB",
            icon: <FaUserSecret />,
        },
        {
            name: "Поэта",
            url: process.env.NEXT_PUBLIC_REFBOT + "?start=poet_6A3C3BBB",
            icon: <FaBookBookmark />,
        },
        {
            name: "Видеомантажер",
            url: process.env.NEXT_PUBLIC_REFBOT + "?start=ve_6A3C3AAA",
            icon: <IoIosMusicalNotes />,
        },
    ],
}

const baseTeam: Omit<Team, "content"> = {
    name: "Подари песню",
    logo: Music2,
    plan: "Панель управления",
    url: "/",
}

const staffTeamContent: TeamContent = adminchikContent

const agentTeamContent: TeamContent = {
    navMain: [
        {
            title: "Консультант",
            url: "/consultant/metrics",
            icon: Users,
            isActive: true,
            items: [
                { title: "Статистика", url: "/consultant/metrics/statistics" },
                { title: "Партнёры", url: "/consultant/partners" },
                { title: "Данные", url: "/consultant/data" },
            ],
        },
    ],
    projects: [],
}

const spTeamContent: TeamContent = {
    navMain: [
        {
            title: "Партнёр",
            url: "/sales-point/metrics",
            icon: Briefcase,
            isActive: true,
            items: [
                { title: "Статистика", url: "/sales-point/metrics/statistics" },
                // { title: "Баннеры", url: "/sales-point/metrics/banners" },
                { title: "Точки продажи", url: "/sales-point/outlets" },
                { title: "Данные", url: "/sales-point/data" },
            ],
        },
    ],
    projects: [],
}

const poetTeamContent: TeamContent = {
    navMain: [
        {
            title: "Поэт",
            url: "/poet/metrics",
            icon: PenLine,
            isActive: true,
            items: [
                { title: "Чаты", url: "/poet/metrics/statistics" },
            ],
        },
    ],
    projects: [],
}

const veTeamContent: TeamContent = {
    navMain: [
        {
            title: "Видеомантажер",
            url: "/video-editor/metrics",
            icon: Video,
            isActive: true,
            items: [
                { title: "Чаты", url: "/video-editor/metrics/statistics" },
            ],
        },
    ],
    projects: [],
}

type RoleSidebar = {
    plan: string
    content: TeamContent
}

export const sidebarContentByRole: Record<RoleType, RoleSidebar> = {
    [RoleType.STAFF]: { plan: "Панель управления", content: staffTeamContent },
    [RoleType.AGENT]: { plan: "Панель управления", content: agentTeamContent },
    [RoleType.SALES_POINT]: { plan: "Панель управления", content: spTeamContent },
    [RoleType.POET]: { plan: "Панель управления", content: poetTeamContent },
    [RoleType.VIDEO_EDITOR]: { plan: "Панель управления", content: veTeamContent },
}

function mergeContent(target: TeamContent, source: TeamContent) {
    for (const nav of source.navMain) {
        if (!target.navMain.find(n => n.url === nav.url)) {
            target.navMain.push(nav)
        }
    }
    for (const project of source.projects) {
        if (!target.projects.find(p => p.url === project.url)) {
            target.projects.push(project)
        }
    }
}

export function getSidebarContent(roles: RoleType[]) {
    const combinedContent: TeamContent = { navMain: [], projects: [] }
    let plan = baseTeam.plan
    for (const role of roles) {
        const roleData = sidebarContentByRole[role]
        if (roleData) {
            plan = roleData.plan
            mergeContent(combinedContent, roleData.content)
        }
    }

    if (combinedContent.navMain.length === 0 && combinedContent.projects.length === 0) {
        return { teams: [{ ...baseTeam, plan: sidebarContentByRole[RoleType.AGENT].plan, content: agentTeamContent }] }
    }

    return { teams: [{ ...baseTeam, plan, content: combinedContent }] }
}
