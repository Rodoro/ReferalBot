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
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
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
import { ArrowUpDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils/utils";
import { Skeleton } from "@/shared/ui/branding/skeleton";

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
    newClients: number;
    songGenerations: number;
    trialGenerations: number;
    purchasedSongs: number;
    poemOrders: number;
    videoOrders: number;
    accrued: number; // Сумма начислений (по последним 4 действиям)
    // payable: number; // accrued × (percent/100)
};

export type StatsMode = 'all' | 'agent' | 'salesPoint' | 'salesOutlet';

interface ServiceStatsPanelProps {
    mode?: StatsMode;
    id?: number;
    showAgentFilter?: boolean;
}

export function ServiceStatsPanel({
    mode = 'all',
    id,
    showAgentFilter = mode === 'all',
}: ServiceStatsPanelProps) {
    // 1) Сырые «дневные» события и состояние загрузки/ошибки
    const [rawData, setRawData] = useState<DailyStat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 2) Состояния фильтров и процента
    const [selectedPeriod, setSelectedPeriod] = useState<
        "today" | "yesterday" | "thisMonth" | "lastMonth"
    >("thisMonth");
    const [selectedAgent, setSelectedAgent] = useState<string>("all");
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
                let data: DailyStat[] = [];
                if (mode === 'agent' && id) {
                    data = await getDailyStatsByAgent(id);
                } else if (mode === 'salesPoint' && id) {
                    data = await getDailyStatsBySalesPoint(id);
                } else if (mode === 'salesOutlet' && id) {
                    data = await getDailyStatsBySalesOutlet(id);
                } else {
                    data = await getDailyStats();
                }
                setRawData(data);
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

    // 4) Проверка, попадает ли дата в выбранный период
    function isInPeriod(dateStr: string, period: typeof selectedPeriod): boolean {
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

    // 5) Список уникальных консультантов для селектора
    const agentOptions = useMemo(() => {
        const setAgents = new Set<string>();
        rawData.forEach((row) => setAgents.add(row.agentName));
        return Array.from(setAgents).sort();
    }, [rawData]);

    // 6) Отфильтрованные события по периоду, консультанту и поиску
    const filteredEvents = useMemo(() => {
        return rawData.filter((row) => {
            if (!isInPeriod(row.date, selectedPeriod)) return false;
            if (showAgentFilter && selectedAgent !== "all" && row.agentName !== selectedAgent) return false;
            const text = searchValue.trim().toLowerCase();
            if (text) {
                const a = row.agentName.toLowerCase();
                const p = row.pointName.toLowerCase();
                const o = (row.outletName ?? '').toLowerCase();
                if (!a.includes(text) && !p.includes(text) && !o.includes(text)) return false;
            }
            return true;
        });
    }, [rawData, selectedPeriod, selectedAgent, searchValue]);

    // 7) Агрегация (groupBy agentName + pointName), считаем accrued и payable
    const aggregatedRows: ServiceStatRow[] = useMemo(() => {
        type Key = string; // "agentName||pointName||outletName"
        const map = new Map<Key, Omit<ServiceStatRow, "accrued" | "payable">>();

        filteredEvents.forEach((row) => {
            const outlet = row.outletName ?? 'Неопределенного';
            const key: Key = `${row.agentName}||${row.pointName}||${outlet}`;
            if (!map.has(key)) {
                map.set(key, {
                    agentName: row.agentName,
                    pointName: row.pointName,
                    outletName: outlet,
                    newClients: 0,
                    songGenerations: 0,
                    trialGenerations: 0,
                    purchasedSongs: 0,
                    poemOrders: 0,
                    videoOrders: 0,
                });
            }
            const accum = map.get(key)!;
            accum.newClients += row.newClients;
            accum.songGenerations += row.songGenerations;
            accum.trialGenerations += row.trialGenerations;
            accum.purchasedSongs += row.purchasedSongs;
            accum.poemOrders += row.poemOrders;
            accum.videoOrders += row.videoOrders;
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
                accrued
            });
        });

        return result;
    }, [filteredEvents]);

    // 8) Итоги «ИТОГО количество» (для всех count-столбцов)
    const totals = useMemo(() => {
        return aggregatedRows.reduce(
            (acc, row) => {
                acc.newClients += row.newClients;
                acc.songGenerations += row.songGenerations;
                acc.trialGenerations += row.trialGenerations;
                acc.purchasedSongs += row.purchasedSongs;
                acc.poemOrders += row.poemOrders;
                acc.videoOrders += row.videoOrders;
                return acc;
            },
            {
                newClients: 0,
                songGenerations: 0,
                trialGenerations: 0,
                purchasedSongs: 0,
                poemOrders: 0,
                videoOrders: 0,
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
                cell: (info) => <span>{info.getValue<string>()}</span>,
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
            {
                accessorKey: "trialGenerations",
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        Пробных<br />генераций
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
            // {
            //     accessorKey: "payable",
            //     header: ({ column }) => (
            //         <Button
            //             variant="ghost"
            //             onClick={() =>
            //                 column.toggleSorting(column.getIsSorted() === "asc")
            //             }
            //         >
            //             К выплате
            //             <ArrowUpDown className="ml-2 h-4 w-4" />
            //         </Button>
            //     ),
            //     cell: (info) => (
            //         <span className="block text-center">
            //             {info.getValue<number>().toFixed(2)}
            //         </span>
            //     ),
            // },
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
                        newClients: 0,
                        songGenerations: 0,
                        trialGenerations: 0,
                        purchasedSongs: 0,
                        poemOrders: 0,
                        videoOrders: 0,
                        accrued: 0,
                    },
                    partners: new Map(),
                });
            }

            const agentData = map.get(row.agentName)!;
            agentData.totals.newClients += row.newClients;
            agentData.totals.songGenerations += row.songGenerations;
            agentData.totals.trialGenerations += row.trialGenerations;
            agentData.totals.purchasedSongs += row.purchasedSongs;
            agentData.totals.poemOrders += row.poemOrders;
            agentData.totals.videoOrders += row.videoOrders;
            agentData.totals.accrued += row.accrued;

            if (!agentData.partners.has(row.pointName)) {
                agentData.partners.set(row.pointName, {
                    totals: {
                        agentName: row.agentName,
                        pointName: row.pointName,
                        outletName: '',
                        newClients: 0,
                        songGenerations: 0,
                        trialGenerations: 0,
                        purchasedSongs: 0,
                        poemOrders: 0,
                        videoOrders: 0,
                        accrued: 0,
                    },
                    outlets: [],
                });
            }

            const partnerData = agentData.partners.get(row.pointName)!;
            partnerData.totals.newClients += row.newClients;
            partnerData.totals.songGenerations += row.songGenerations;
            partnerData.totals.trialGenerations += row.trialGenerations;
            partnerData.totals.purchasedSongs += row.purchasedSongs;
            partnerData.totals.poemOrders += row.poemOrders;
            partnerData.totals.videoOrders += row.videoOrders;
            partnerData.totals.accrued += row.accrued;

            partnerData.outlets.push(r);
        });

        return Array.from(map.values()).map((agent) => ({
            totals: agent.totals,
            partners: Array.from(agent.partners.values()),
        }));
    }, [aggregatedRows, sorting]);

    // 12) Обработка загрузки / ошибки
    if (loading) return <Skeleton className="h-[350px] w-full" />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <>
            <div className="grid grid-cols-4 gap-4 mb-6">
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
                        <SelectItem value="thisMonth">За текущий месяц</SelectItem>
                        <SelectItem value="lastMonth">За прошлый месяц</SelectItem>
                    </SelectContent>
                </Select>

                {/* Консультант */}
                {showAgentFilter && (
                    <Select
                        value={selectedAgent}
                        onValueChange={(v) => setSelectedAgent(v)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Консультант" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">Все консультанты</SelectItem>
                            {agentOptions.map((agent, index) => (
                                <SelectItem key={index} value={agent}>
                                    {agent}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="h-16">
                            <TableHead>Консультант</TableHead>
                            <TableHead className="min-w-[220px]">Партнёр</TableHead>
                            <TableHead className="min-w-[220px]">Точка продажи</TableHead>
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
                            <TableHead className="text-center">
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
                            </TableHead>
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
                            </TableHead>
                            <TableHead className="text-center">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        table.getColumn("payable")?.toggleSorting(
                                            table.getColumn("payable")?.getIsSorted() === "asc"
                                        )
                                    }
                                >
                                    К выплате
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="font-medium">
                            <TableCell>ИТОГО:</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-center">{totals.newClients}</TableCell>
                            <TableCell className="text-center">{totals.songGenerations}</TableCell>
                            <TableCell className="text-center">{totals.trialGenerations}</TableCell>
                            <TableCell className="text-center">{totals.purchasedSongs}</TableCell>
                            <TableCell className="text-center">{totals.poemOrders}</TableCell>
                            <TableCell className="text-center">{totals.videoOrders}</TableCell>
                        </TableRow>
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
                                        <TableCell className="text-center">{agent.totals.newClients}</TableCell>
                                        <TableCell className="text-center">{agent.totals.songGenerations}</TableCell>
                                        <TableCell className="text-center">{agent.totals.trialGenerations}</TableCell>
                                        <TableCell className="text-center">{agent.totals.purchasedSongs}</TableCell>
                                        <TableCell className="text-center">{agent.totals.poemOrders}</TableCell>
                                        <TableCell className="text-center">{agent.totals.videoOrders}</TableCell>
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
                                                        <TableCell className="text-center">{partner.totals.newClients}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.songGenerations}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.trialGenerations}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.purchasedSongs}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.poemOrders}</TableCell>
                                                        <TableCell className="text-center">{partner.totals.videoOrders}</TableCell>
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
