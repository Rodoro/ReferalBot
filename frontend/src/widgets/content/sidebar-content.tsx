// content/sidebar-content.ts
import {
    BookOpen,
    SquareTerminal,
    Send,
    AreaChart,
    Music2
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
            url: "https://t.me/TestBotReferalSystemBot",
            icon: Send,
        },
        {
            title: "Подари песню Bot",
            url: "https://t.me/podaripesnyu_bot",
            icon: Send,
        },
    ],
}

const adminchikContent: TeamContent = {
    navMain: [
        {
            title: "Администрирование",
            url: "/",
            icon: SquareTerminal,
            isActive: true,
            items: [
                { title: "Сотрудники", url: "/staff" },
                { title: "Консультанты", url: "/agent" },
                { title: "Точки продаж", url: "/sales-point" },
                { title: "Поэты", url: "/poets" },
                { title: "Видеомонтажеры", url: "/video-editors" },
                { title: "Пользователи", url: "/users" },
            ],
        },
        {
            title: "Метрики",
            url: "/metrics",
            icon: AreaChart,
            isActive: true,
            items: [
                { title: "Статистика", url: "/metrics/statistics" },
            ],
        },
        {
            title: "Файлы",
            url: "/files",
            icon: BookOpen,
            isActive: true,
            items: [
                { title: "Баннеры", url: "/files/banners" },
                { title: "Договоры", url: "/files/сontracts" },
            ],
        },
    ],
    projects: [
        {
            name: "Консультант",
            url: "https://t.me/TestBotReferalSystemBot?start=secret_6A3C3FFB",
            icon: <FaUserSecret />,
        },
        {
            name: "Поэта",
            url: "https://t.me/TestBotReferalSystemBot?start=poet_6A3C3BBB",
            icon: <FaBookBookmark />,
        },
        {
            name: "Видеомантажер",
            url: "https://t.me/TestBotReferalSystemBot?start=ve_6A3C3AAA",
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
            title: "Метрики",
            url: "/consultant/metrics",
            icon: AreaChart,
            isActive: true,
            items: [
                { title: "Статистика", url: "/consultant/metrics/statistics" },
            ],
        },
    ],
    projects: [],
}

const spTeamContent: TeamContent = {
    navMain: [
        {
            title: "Точка продаж",
            url: "/sales-point/metrics",
            icon: AreaChart,
            isActive: true,
            items: [
                { title: "Статистика", url: "/sales-point/metrics/statistics" },
                { title: "Баннеры", url: "/sales-point/metrics/banners" },
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
            icon: AreaChart,
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
            icon: AreaChart,
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
    [RoleType.STAFF]: { plan: "Админ панель", content: staffTeamContent },
    [RoleType.AGENT]: { plan: "Консультант", content: agentTeamContent },
    [RoleType.SALES_POINT]: { plan: "Точка продажи", content: spTeamContent },
    [RoleType.POET]: { plan: "Консультант", content: poetTeamContent },
    [RoleType.VIDEO_EDITOR]: { plan: "Консультант", content: veTeamContent },
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
