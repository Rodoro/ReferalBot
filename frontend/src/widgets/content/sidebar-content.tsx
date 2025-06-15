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
        // {
        //     title: "Ссылка например на чат с гпт по проекту",
        //     url: "https://example.com",
        //     icon: MessageCircleWarning,
        // }
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
                { title: "Агенты", url: "/agent" },
                { title: "Точки продаж", url: "/sales-point" },
                { title: "Поэты", url: "/poets" },
                { title: "Видеомонтажеры", url: "/video-editors" },
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
            name: "Агент",
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

const staffSidebarContent: { teams: Team[] } = {
    teams: [
        {
            name: "Подари песню",
            logo: Music2,
            plan: "Админ панель",
            url: "/",
            content: adminchikContent,
        },
    ],
}

const agentSidebarContent: { teams: Team[] } = {
    teams: [
        {
            name: "Подари песню",
            logo: Music2,
            plan: "Агент",
            url: "/",
            content: {
                navMain: [
                    {
                        title: "Файлы",
                        url: "/files",
                        icon: BookOpen,
                        isActive: true,
                        items: [{ title: "Баннеры", url: "/files/banners" }],
                    },
                ],
                projects: [],
            },
        },
    ],
}

export const sidebarContentByRole: Record<RoleType, { teams: Team[] }> = {
    [RoleType.STAFF]: staffSidebarContent,
    [RoleType.AGENT]: agentSidebarContent,
    [RoleType.SALES_POINT]: agentSidebarContent,
    [RoleType.POET]: agentSidebarContent,
    [RoleType.VIDEO_EDITOR]: agentSidebarContent,
}

export function getSidebarContent(role: RoleType = RoleType.AGENT) {
    return sidebarContentByRole[role] || agentSidebarContent
}
