// content/sidebar-content.ts
import {
    BookOpen,
    HardDrive,
    SquareTerminal,
    Send,
    MessageCircleWarning,
    AreaChart,
    Music2
} from "lucide-react"
import { Team, TeamContent } from "../types/sidebar"

// Меню над авой
export const commonSidebarContent = {
    navSecondary: [
        {
            title: "Ссылка куданибудь",
            url: "https://example.com",
            icon: HardDrive,
        },
        {
            title: "Ссылка в телеграмм канал проекта",
            url: "https://example.com",
            icon: Send,
        },
        {
            title: "Ссылка например на чат с гпт по проекту",
            url: "https://example.com",
            icon: MessageCircleWarning,
        }
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
            name: "Referal bot",
            url: "https://example.com",
            icon: Send,
        },
        {
            name: "Подари песню bot",
            url: "https://example.com",
            icon: Send,
        },
    ],
}

export const appSidebarContent: {
    teams: Team[]
} = {
    teams: [
        {
            name: "Подари песню",
            logo: Music2,
            plan: "Админ панель",
            url: "/",
            content: adminchikContent
        },
    ],
}
