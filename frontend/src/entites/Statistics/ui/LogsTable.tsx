/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ServiceStatsPanel.tsx
'use client';

import { useEffect, useMemo, useState, Fragment } from "react";
import {
    getDailyStats,
    getDailyStatsByAgent,
    getDailyStatsBySalesPoint,
    getDailyStatsBySalesOutlet,
    DailyStat,
} from "../lib/api/service-stats-api";
import { OutletType } from '@/entites/SalesOutlet/types/sales-outlet';
import { OutletTypeIcon } from '@/entites/SalesOutlet/ui/OutletTypeIcon';
type DailyStatWithClients = DailyStat & { totalClients?: number; outletType?: OutletType };
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {
    getArchitecture,
    ArchitectureAgent,
} from "../../Architecture/lib/api/architecture-api";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/shared/ui/branding/table";
import { Input } from "@/shared/ui/form/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/shared/ui/form/select";
import { Button } from "@/shared/ui/form/button";
import {
    ArrowUpDown,
    ChevronRight,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { cn } from "@/shared/lib/utils/utils";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/shared/ui/overlay/card";
import { Skeleton } from "@/shared/ui/branding/skeleton";
import { PAYOUT_MULTIPLIER } from "@/widgets/content/rate";
import { Badge } from "@/shared/ui/branding/badge";

//TODO: За выбранный промежуток времени
//TODO: Чек бокс на скрытие пустых ячеек

// Весовые коэффициенты для «Начислено» (только последние 4 действия)
const WEIGHTS = {
    trialGenerations: 40,
    purchasedSongs: 600,
    poemOrders: 2000,
    videoOrders: 10000,
};

type ServiceStatRow = {
    agentName: string;
    pointName: string;
    outletName: string;
    outletType?: OutletType;
    totalClients: number;
    newClients: number;
    songGenerations: number;
    trialGenerations: number;
    purchasedSongs: number;
    poemOrders: number;
    videoOrders: number;
    accrued: number;
    payable: number;
};

export type StatsMode = 'all' | 'agent' | 'salesPoint' | 'salesOutlet';

interface ServiceStatsPanelProps {
    mode?: StatsMode;
    id?: number;
}

export function ServiceStatsPanel({
    mode = 'all',
    id,
}: ServiceStatsPanelProps) {
    // 1) Сырые «дневные» события и состояние загрузки/ошибки
    const [rawData, setRawData] = useState<DailyStatWithClients[]>([]);
    const [archData, setArchData] = useState<ArchitectureAgent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 2) Состояния фильтров и процента
    const [selectedPeriod, setSelectedPeriod] = useState<
        "today" | "yesterday" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth"
    >("thisMonth");
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    // const [percent, setPercent] = useState<number>(10);
    const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});
    const [expandedPartners, setExpandedPartners] = useState<Record<string, boolean>>({});

    function togglePartner(key: string) {
        setExpandedPartners((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    function toggleAgent(name: string) {
        setExpandedAgents((prev) => ({ ...prev, [name]: !prev[name] }));
    }

    // 3) Загрузка сырых данных при монтировании
    useEffect(() => {
        async function fetchAll() {
            try {
                setLoading(true);
                let data: DailyStatWithClients[] = [];
                if (mode === 'agent' && id) {
                    data = await getDailyStatsByAgent(id);
                } else if (mode === 'salesPoint' && id) {
                    data = await getDailyStatsBySalesPoint(id);
                } else if (mode === 'salesOutlet' && id) {
                    data = await getDailyStatsBySalesOutlet(id);
                } else {
                    data = await getDailyStats();
                }
                const arch = await getArchitecture(true);
                setRawData(data);
                setArchData(arch);
                setError(null);
            } catch (e) {
                console.error(e);
                setError('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, [mode, id]);


    useEffect(() => {
        if (!archData.length) return;

        if (mode === 'all') {
            setExpandedAgents({});
            setExpandedPartners({});
            return;
        }

        const agentState: Record<string, boolean> = {};
        const partnerState: Record<string, boolean> = {};
        archData.forEach(agent => {
            agentState[agent.fullName] = true;
            agent.partners.forEach(partner => {
                const key = `${agent.fullName}||${partner.fullName}`;
                partnerState[key] = true;
            });
        });
        setExpandedAgents(agentState);
        setExpandedPartners(partnerState);
    }, [archData]);

    // 4) Проверка, попадает ли дата в выбранный период
    function isInPeriod(dateStr: string, period: typeof selectedPeriod): boolean {
        if (!dateStr) return true;
        const date = new Date(dateStr);
        const now = new Date();
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (period === "today") {
            return dateOnly.getTime() === todayOnly.getTime();
        }
        if (period === "yesterday") {
            const yesterday = new Date(todayOnly.getTime() - 24 * 60 * 60 * 1000);
            return dateOnly.getTime() === yesterday.getTime();
        }
        if (period === "thisWeek") {
            const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
            const weekStart = new Date(todayOnly.getTime() - day * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            return dateOnly.getTime() >= weekStart.getTime() && dateOnly.getTime() < weekEnd.getTime();
        }
        if (period === "lastWeek") {
            const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
            const weekEnd = new Date(todayOnly.getTime() - day * 24 * 60 * 60 * 1000);
            const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
            return dateOnly.getTime() >= weekStart.getTime() && dateOnly.getTime() < weekEnd.getTime();
        }
        if (period === "thisMonth") {
            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth()
            );
        }
        if (period === "lastMonth") {
            const ym =
                now.getMonth() === 0
                    ? { year: now.getFullYear() - 1, month: 11 }
                    : { year: now.getFullYear(), month: now.getMonth() - 1 };
            return date.getFullYear() === ym.year && date.getMonth() === ym.month;
        }
        return false;
    }

    // Расчётный период с 1-го по 1-е число следующего месяца
    function getAccountingPeriod() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        return { start, end };
    }

    const { start: accStart, end: accEnd } = useMemo(getAccountingPeriod, []);

    const currentPayable = useMemo(() => {
        const from = accStart.getTime();
        const to = accEnd.getTime();
        return rawData.reduce((sum, row) => {
            if (!row.date) return sum;
            const t = new Date(row.date).getTime();
            if (t >= from && t < to) {
                return sum + row.toPay;
            }
            return sum;
        }, 0);
    }, [rawData, accStart, accEnd]);

    const periodLabel = useMemo(() => {
        const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        const endDisplay = new Date(accEnd.getTime() - 1);
        return `${accStart.toLocaleDateString('ru-RU', opts)} – ${endDisplay.toLocaleDateString('ru-RU', opts)}`;
    }, [accStart, accEnd]);

    function getPrevPeriod() {
        const end = new Date(accStart.getFullYear(), accStart.getMonth(), 10);
        const start = new Date(end.getFullYear(), end.getMonth() - 1, 10);
        return { start, end };
    }

    const { start: prevStart, end: prevEnd } = useMemo(getPrevPeriod, [accStart]);

    const prevPayable = useMemo(() => {
        const from = prevStart.getTime();
        const to = prevEnd.getTime();
        return rawData.reduce((sum, row) => {
            if (!row.date) return sum;
            const t = new Date(row.date).getTime();
            if (t >= from && t < to) {
                return sum + row.toPay;
            }
            return sum;
        }, 0);
    }, [rawData, prevStart, prevEnd]);

    const consultantPayable = currentPayable;
    const partnerPayable = currentPayable;

    const prevConsultantPayable = prevPayable / PAYOUT_MULTIPLIER;
    const prevPartnerPayable = prevPayable - prevConsultantPayable;

    const consultantDelta = consultantPayable - prevConsultantPayable;
    const partnerDelta = partnerPayable - prevPartnerPayable;

    // 5) Список уникальных консультантов для селектора
    const architectureRows = useMemo(() => {
        const rows: DailyStatWithClients[] = [];
        archData.forEach((agent) => {
            if (mode === 'agent' && id && agent.id !== id) return;
            agent.partners.forEach((partner) => {
                if (mode === 'salesPoint' && id && partner.id !== id) return;
                if (partner.outlets.length === 0) {
                    if (mode === 'salesOutlet') return;
                    rows.push({
                        date: '',
                        agentName: agent.fullName,
                        pointName: partner.fullName,
                        outletName: '',
                        totalClients: partner.userCount,
                        newClients: 0,
                        songGenerations: 0,
                        trialGenerations: 0,
                        purchasedSongs: 0,
                        poemOrders: 0,
                        videoOrders: 0,
                        toPay: 0,
                    });
                }
                partner.outlets.forEach((outlet) => {
                    if (mode === 'salesOutlet' && id && outlet.id !== id) return;
                    rows.push({
                        date: '',
                        agentName: agent.fullName,
                        pointName: partner.fullName,
                        outletName: outlet.name,
                        outletType: outlet.type,
                        totalClients: outlet.userCount,
                        newClients: 0,
                        songGenerations: 0,
                        trialGenerations: 0,
                        purchasedSongs: 0,
                        poemOrders: 0,
                        videoOrders: 0,
                        toPay: 0,
                    });
                });
            });
        });
        return rows;
    }, [archData, mode, id]);

    const allData = useMemo<DailyStatWithClients[]>(
        () => [...rawData, ...architectureRows],
        [rawData, architectureRows]
    );
    // 7) Отфильтрованные события по периоду, консультанту и поиску
    const filteredEvents = useMemo<DailyStatWithClients[]>(() => {
        return allData.filter((row) => {
            if (dateFrom || dateTo) {
                if (dateFrom && new Date(row.date) < new Date(dateFrom)) return false;
                if (dateTo && new Date(row.date) > new Date(dateTo)) return false;
            } else {
                if (!isInPeriod(row.date, selectedPeriod)) return false;
            }
            const text = searchValue.trim().toLowerCase();
            if (text) {
                const a = row.agentName.toLowerCase();
                const p = row.pointName.toLowerCase();
                const o = (row.outletName ?? '').toLowerCase();
                if (!a.includes(text) && !p.includes(text) && !o.includes(text)) return false;
            }
            return true;
        });
    }, [allData, selectedPeriod, dateFrom, dateTo, searchValue]);

    // 8) Агрегация (groupBy agentName + pointName), считаем accrued и payable
    const aggregatedRows: ServiceStatRow[] = useMemo(() => {
        type Key = string; // "agentName||pointName||outletName"
        const map = new Map<Key, ServiceStatRow>();

        filteredEvents.forEach((row) => {
            const outlet = row.outletName ?? 'Неопределенного';
            const key: Key = `${row.agentName}||${row.pointName}||${outlet}`;
            if (!map.has(key)) {
                map.set(key, {
                    agentName: row.agentName,
                    pointName: row.pointName,
                    outletName: outlet,
                    outletType: row.outletType,
                    totalClients: 0,
                    newClients: 0,
                    songGenerations: 0,
                    trialGenerations: 0,
                    purchasedSongs: 0,
                    poemOrders: 0,
                    videoOrders: 0,
                    accrued: 0,
                    payable: 0,
                });
            }
            const accum = map.get(key)!;
            if (row.totalClients) {
                accum.totalClients = accum.totalClients + row.totalClients
            }
            accum.newClients += row.newClients;
            accum.songGenerations += row.songGenerations;
            accum.trialGenerations += row.trialGenerations;
            accum.purchasedSongs += row.purchasedSongs;
            accum.poemOrders += row.poemOrders;
            accum.videoOrders += row.videoOrders;
            accum.payable += row.toPay;
        });
        const result: ServiceStatRow[] = [];
        map.forEach((vals) => {
            // Начисления по последним 4 действиям:
            const trialAcc = vals.trialGenerations * WEIGHTS.trialGenerations;
            const purchAcc = vals.purchasedSongs * WEIGHTS.purchasedSongs;
            const poemAcc = vals.poemOrders * WEIGHTS.poemOrders;
            const videoAcc = vals.videoOrders * WEIGHTS.videoOrders;
            const accrued = trialAcc + purchAcc + poemAcc + videoAcc;
            // const payable = parseFloat(((accrued * percent) / 100).toFixed(2));

            result.push({
                ...vals,
                accrued,
            });
        });

        return result;
    }, [filteredEvents]);

    // 8) Итоги «ИТОГО количество» (для всех count-столбцов)
    const totals = useMemo(() => {
        return aggregatedRows.reduce(
            (acc, row) => {
                acc.totalClients += row.totalClients;
                acc.newClients += row.newClients;
                acc.songGenerations += row.songGenerations;
                acc.purchasedSongs += row.purchasedSongs;
                acc.poemOrders += row.poemOrders;
                acc.videoOrders += row.videoOrders;
                acc.payable += row.payable;
                return acc;
            },
            {
                totalClients: 0,
                newClients: 0,
                songGenerations: 0,
                purchasedSongs: 0,
                poemOrders: 0,
                videoOrders: 0,
                payable: 0,
            }
        );
    }, [aggregatedRows]);

    // 11) Колонки для React Table (с явными типами в getValue())
    const columns = useMemo<ColumnDef<ServiceStatRow>[]>(
        () => [
            {
                accessorKey: "agentName",
                header: "Консультант",
                cell: (info) => <span>{info.getValue<string>()}</span>,
            },
            {
                accessorKey: "pointName",
                header: "Партнёр",
                cell: (info) => <span>{info.getValue<string>()}</span>,
            },
            {
                accessorKey: "outletName",
                header: "Точка продажи",
                cell: (info) => (
                    <span className="flex items-center gap-1">
                        {info.row.original.outletType && (
                            <OutletTypeIcon type={info.row.original.outletType} className="h-4 w-4" />
                        )}
                        {info.getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: "totalClients",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Всего<br />клиентов
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
            {
                accessorKey: "newClients",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Новых<br />клиентов
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
            {
                accessorKey: "songGenerations",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Генераций<br />песен
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
            // {
            //     accessorKey: "trialGenerations",
            //     header: ({ column }) => (
            //         <Button
            //             variant="ghost"
            //             onClick={() =>
            //                 column.toggleSorting(column.getIsSorted() === "asc")
            //             }
            //         >
            //             Пробных<br />генераций
            //             <ArrowUpDown className="ml-2 h-4 w-4" />
            //         </Button>
            //     ),
            //     cell: (info) => (
            //         <span className="block text-center">
            //             {info.getValue<number>()}
            //         </span>
            //     ),
            // },
            {
                accessorKey: "purchasedSongs",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Выкупленных<br />песен
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
            {
                accessorKey: "poemOrders",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Заказов<br />стихов
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
            {
                accessorKey: "videoOrders",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Заказов<br />роликов
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
            // {
            //     accessorKey: "accrued",
            //     header: ({ column }) => (
            //         <Button
            //             variant="ghost"
            //             onClick={() =>
            //                 column.toggleSorting(column.getIsSorted() === "asc")
            //             }
            //         >
            //             Начислено
            //             <ArrowUpDown className="ml-2 h-4 w-4" />
            //         </Button>
            //     ),
            //     cell: (info) => (
            //         <span className="block text-center">
            //             {info.getValue<number>()}
            //         </span>
            //     ),
            // },
            {
                accessorKey: "payable",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        К выплате
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: (info) => (
                    <span className="block text-center">
                        {info.getValue<number>()}
                    </span>
                ),
            },
        ],
        []
    );

    // 11) Инициализируем React Table для сортировки
    const [sorting, setSorting] = useState<SortingState>([]);
    const table = useReactTable({
        data: aggregatedRows,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // 12) Группировка по консультанту с подсчётом итогов
    const groupedByAgent = useMemo(() => {
        type PartnerInfo = { totals: ServiceStatRow; outlets: any[] };
        const map = new Map<string, { totals: ServiceStatRow; partners: Map<string, PartnerInfo> }>();

        table.getRowModel().rows.forEach((r) => {
            const row = r.original as ServiceStatRow;

            if (!map.has(row.agentName)) {
                map.set(row.agentName, {
                    totals: {
                        agentName: row.agentName,
                        pointName: '',
                        outletName: '',
                        totalClients: 0,
                        newClients: 0,
                        songGenerations: 0,
                        trialGenerations: 0,
                        purchasedSongs: 0,
                        poemOrders: 0,
                        videoOrders: 0,
                        accrued: 0,
                        payable: 0,
                    },
                    partners: new Map(),
                });
            }

            const agentData = map.get(row.agentName)!;
            if (row.totalClients) {
                agentData.totals.totalClients =
                    agentData.totals.totalClients +
                    row.totalClients
            }
            agentData.totals.newClients += row.newClients;
            agentData.totals.songGenerations += row.songGenerations;
            agentData.totals.trialGenerations += row.trialGenerations;
            agentData.totals.purchasedSongs += row.purchasedSongs;
            agentData.totals.poemOrders += row.poemOrders;
            agentData.totals.videoOrders += row.videoOrders;
            agentData.totals.accrued += row.accrued;
            agentData.totals.payable += row.payable;

            if (!agentData.partners.has(row.pointName)) {
                agentData.partners.set(row.pointName, {
                    totals: {
                        agentName: row.agentName,
                        pointName: row.pointName,
                        outletName: '',
                        totalClients: 0,
                        newClients: 0,
                        songGenerations: 0,
                        trialGenerations: 0,
                        purchasedSongs: 0,
                        poemOrders: 0,
                        videoOrders: 0,
                        accrued: 0,
                        payable: 0,
                    },
                    outlets: [],
                });
            }

            const partnerData = agentData.partners.get(row.pointName)!;
            if (row.totalClients) {
                partnerData.totals.totalClients =
                    partnerData.totals.totalClients +
                    row.totalClients

            }
            partnerData.totals.newClients += row.newClients;
            partnerData.totals.songGenerations += row.songGenerations;
            partnerData.totals.trialGenerations += row.trialGenerations;
            partnerData.totals.purchasedSongs += row.purchasedSongs;
            partnerData.totals.poemOrders += row.poemOrders;
            partnerData.totals.videoOrders += row.videoOrders;
            partnerData.totals.accrued += row.accrued;
            partnerData.totals.payable += row.payable;

            partnerData.outlets.push(r);
        });

        const agents = Array.from(map.values()).map((agent) => ({
            totals: agent.totals,
            partners: Array.from(agent.partners.values()),
        }));

        if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            const compare = (a: any, b: any) => {
                const av = a.totals[id as keyof ServiceStatRow];
                const bv = b.totals[id as keyof ServiceStatRow];
                if (typeof av === 'number' && typeof bv === 'number') {
                    return desc ? bv - av : av - bv;
                }
                const as = String(av ?? '');
                const bs = String(bv ?? '');
                return desc ? bs.localeCompare(as) : as.localeCompare(bs);
            };
            agents.sort(compare);
            agents.forEach((agent) => agent.partners.sort(compare));
        }

        return agents;
    }, [aggregatedRows, sorting]);

    // 12) Обработка загрузки / ошибки
    if (loading) return <Skeleton className="h-[350px] w-full" />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <>
            <div
                className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card grid grid-cols-1 sm:grid-cols-3 gap-4 *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 mb-6"
            >
                {mode === 'all' ? (
                    <>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Выплаты консультантам</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {consultantPayable.toLocaleString('ru-RU')} ₽
                                </CardTitle>
                                {/* <CardAction>
                                    <Badge variant="outline">
                                        {consultantDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
                                        {consultantDelta >= 0 ? '+' : ''}
                                        {consultantDelta.toLocaleString('ru-RU')} ₽
                                    </Badge>
                                </CardAction> */}
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    {consultantDelta >= 0 ? 'Рост за период' : 'Снижение за период'}
                                    {/* {consultantDelta >= 0 ? (
                                        <TrendingUp className="size-4" />
                                    ) : (
                                        <TrendingDown className="size-4" />
                                    )} */}
                                    <Badge variant="outline">
                                        {consultantDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
                                        {consultantDelta >= 0 ? '+' : ''}
                                        {consultantDelta.toLocaleString('ru-RU')} ₽
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground">Период {periodLabel}</div>
                            </CardFooter>
                        </Card>
                        <Card className="@container/card">
                            <CardHeader>
                                <CardDescription>Выплаты партнёрам</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                    {partnerPayable.toLocaleString('ru-RU')} ₽
                                </CardTitle>
                                {/* <CardAction>
                                    <Badge variant="outline">
                                        {partnerDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
                                        {partnerDelta >= 0 ? '+' : ''}
                                        {partnerDelta.toLocaleString('ru-RU')} ₽
                                    </Badge>
                                </CardAction> */}
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    {partnerDelta >= 0 ? 'Рост за период' : 'Снижение за период'}
                                    {/* {partnerDelta >= 0 ? (
                                        <TrendingUp className="size-4" />
                                    ) : (
                                        <TrendingDown className="size-4" />
                                    )} */}
                                    <Badge variant="outline">
                                        {partnerDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
                                        {partnerDelta >= 0 ? '+' : ''}
                                        {partnerDelta.toLocaleString('ru-RU')} ₽
                                    </Badge>
                                </div>
                                <div className="text-muted-foreground">Период {periodLabel}</div>
                            </CardFooter>
                        </Card>
                    </>
                ) : (
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Моя выплата</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {partnerPayable.toLocaleString('ru-RU')} ₽
                            </CardTitle>
                            {/* <CardAction>
                                <Badge variant="outline">
                                    {partnerDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
                                    {partnerDelta >= 0 ? '+' : ''}
                                    {partnerDelta.toLocaleString('ru-RU')} ₽
                                </Badge>
                            </CardAction> */}
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                {partnerDelta >= 0 ? 'Рост за период' : 'Снижение за период'}
                                {/* {partnerDelta >= 0 ? (
                                    <TrendingUp className="size-4" />
                                ) : (
                                    <TrendingDown className="size-4" />
                                )} */}
                                <Badge variant="outline">
                                    {partnerDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
                                    {partnerDelta >= 0 ? '+' : ''}
                                    {partnerDelta.toLocaleString('ru-RU')} ₽
                                </Badge>
                            </div>
                            <div className="text-muted-foreground">Период {periodLabel}</div>
                        </CardFooter>
                    </Card>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                {/* Период */}
                <Select
                    value={selectedPeriod}
                    onValueChange={(v) => setSelectedPeriod(v as any)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Период" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="today">За сегодня</SelectItem>
                        <SelectItem value="yesterday">За вчера</SelectItem>
                        <SelectItem value="thisWeek">За текущую неделю</SelectItem>
                        <SelectItem value="lastWeek">За прошлую неделю</SelectItem>
                        <SelectItem value="thisMonth">За текущий месяц</SelectItem>
                        <SelectItem value="lastMonth">За прошлый месяц</SelectItem>
                    </SelectContent>
                </Select>

                {/* Диапазон дат */}
                <div className="grid grid-cols-3 items-center">
                    Начало периода
                    <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="Начало периода"
                        className="w-full col-span-2"
                    />
                </div>
                <div className="grid grid-cols-3 items-center">
                    Конец периода
                    <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="Конец периода"
                        className="w-full col-span-2"
                    />
                </div>



                {/* Поиск */}
                <Input
                    placeholder="Поиск по консультанту или партнёру..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />

                {/* <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="% выплаты"
                    value={String(percent)}
                    onChange={(e) => {
                        const num = Number(e.target.value);
                        if (!isNaN(num)) setPercent(num);
                    }}
                    className="w-full"
                /> */}
            </div >

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="h-16">
                            <TableHead>Консультант</TableHead>
                            <TableHead className="min-w-[160px]">Партнёр</TableHead>
                            <TableHead className="min-w-[160px]">Точка продажи</TableHead>
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("totalClients")?.toggleSorting(
                                            table.getColumn("totalClients")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Всего<br />клиентов
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("newClients")?.toggleSorting(
                                            table.getColumn("newClients")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Новых<br />клиентов
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("songGenerations")?.toggleSorting(
                                            table.getColumn("songGenerations")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Генераций<br />песен
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            {/* <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("trialGenerations")?.toggleSorting(
                                            table.getColumn("trialGenerations")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Пробных<br />генераций
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead> */}
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("purchasedSongs")?.toggleSorting(
                                            table.getColumn("purchasedSongs")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Выкупленных<br />песен
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("poemOrders")?.toggleSorting(
                                            table.getColumn("poemOrders")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Заказов<br />стихов
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("videoOrders")?.toggleSorting(
                                            table.getColumn("videoOrders")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Заказов<br />роликов
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            {/* <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("accrued")?.toggleSorting(
                                            table.getColumn("accrued")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Начислено
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead> */}
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("payable")?.toggleSorting(
                                            table.getColumn("payable")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    Выплата
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mode !== 'all' || (
                            <TableRow className="font-medium">
                                <TableCell>ИТОГО:</TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-center">{totals.totalClients}</TableCell>
                                <TableCell className="text-center">{totals.newClients}</TableCell>
                                <TableCell className="text-center">{totals.songGenerations}</TableCell>
                                <TableCell className="text-center">{totals.purchasedSongs}</TableCell>
                                <TableCell className="text-center">{totals.poemOrders}</TableCell>
                                <TableCell className="text-center">{totals.videoOrders}</TableCell>
                                <TableCell className="text-center">{(totals.payable * 2).toLocaleString('ru-RU')}</TableCell>
                            </TableRow>
                        )}

                        {groupedByAgent.length > 0 ? (
                            groupedByAgent.map((agent, index) => (
                                <Fragment key={index}>
                                    <TableRow className="bg-muted/60 font-medium">
                                        <TableCell className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => toggleAgent(agent.totals.agentName)}
                                                className="flex items-center"
                                            >
                                                <ChevronRight
                                                    className={cn(
                                                        "h-4 w-4 transition-transform cursor-pointer",
                                                        expandedAgents[agent.totals.agentName] && "rotate-90"
                                                    )}
                                                />
                                            </button>
                                            {agent.totals.agentName}
                                        </TableCell>
                                        <TableCell className="italic text-muted-foreground">Всего</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="text-center">{agent.totals.totalClients}</TableCell>
                                        <TableCell className="text-center">{agent.totals.newClients}</TableCell>
                                        <TableCell className="text-center">{agent.totals.songGenerations}</TableCell>
                                        <TableCell className="text-center">{agent.totals.purchasedSongs}</TableCell>
                                        <TableCell className="text-center">{agent.totals.poemOrders}</TableCell>
                                        <TableCell className="text-center">{agent.totals.videoOrders}</TableCell>
                                        <TableCell className="text-center">{agent.totals.payable.toLocaleString('ru-RU')}</TableCell>
                                    </TableRow>
                                    {expandedAgents[agent.totals.agentName] &&
                                        agent.partners.map((partner, pIndex) => {
                                            const key = `${agent.totals.agentName}||${partner.totals.pointName}`;
                                            return (
                                                <Fragment key={pIndex}>
                                                    <TableRow>
                                                        <TableCell />
                                                        <TableCell className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePartner(key)}
                                                                className="flex items-center"
                                                            >
                                                                <ChevronRight
                                                                    className={cn(
                                                                        "h-4 w-4 transition-transform",
                                                                        expandedPartners[key] && "rotate-90"
                                                                    )}
                                                                />
                                                            </button>
                                                            {partner.totals.pointName}
                                                        </TableCell>
                                                        <TableCell className="italic text-muted-foreground">Всего</TableCell>
                                                        <TableCell className="text-center">{partner.totals.totalClients}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.newClients}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.songGenerations}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.purchasedSongs}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.poemOrders}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.videoOrders}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.payable}</TableCell>
                                                    </TableRow>
                                                    {expandedPartners[key] &&
                                                        partner.outlets.map((row) => (
                                                            <TableRow key={row.id}>
                                                                {row.getVisibleCells().map((cell: any) => (
                                                                    <TableCell
                                                                        key={cell.id}
                                                                        className={
                                                                            cell.column.id === "outletName"
                                                                                ? "min-w-[206px]"
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        {cell.column.id === "agentName" || cell.column.id === "pointName"
                                                                            ? null
                                                                            : flexRender(
                                                                                cell.column.columnDef.cell,
                                                                                cell.getContext()
                                                                            )}
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        ))}
                                                </Fragment>
                                            );
                                        })}
                                </Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={10} className="text-center py-4">
                                    Нет данных.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

        </>
    );
}
