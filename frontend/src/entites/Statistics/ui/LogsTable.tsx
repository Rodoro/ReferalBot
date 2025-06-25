/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ServiceStatsPanel.tsx
'use client';

import { useEffect, useMemo, useState } from "react";
import { getDailyStats, DailyStat } from "../lib/api/service-stats-api";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import {
    CardContent,
} from "@/shared/ui/overlay/card";
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
import { ArrowUpDown } from "lucide-react";
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
    newClients: number;
    songGenerations: number;
    trialGenerations: number;
    purchasedSongs: number;
    poemOrders: number;
    videoOrders: number;
    accrued: number; // Сумма начислений (по последним 4 действиям)
    payable: number; // accrued × (percent/100)
};

export function ServiceStatsPanel() {
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
    const [percent, setPercent] = useState<number>(10); // процент по умолчанию

    // 3) Загрузка сырых данных при монтировании
    useEffect(() => {
        async function fetchAll() {
            try {
                setLoading(true);
                const data = await getDailyStats();
                console.log(data)
                setRawData(data);
                setError(null);
            } catch (e) {
                console.error(e);
                setError("Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

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
            if (selectedAgent !== "all" && row.agentName !== selectedAgent) return false;
            const text = searchValue.trim().toLowerCase();
            if (text) {
                const a = row.agentName.toLowerCase();
                const p = row.pointName.toLowerCase();
                if (!a.includes(text) && !p.includes(text)) return false;
            }
            return true;
        });
    }, [rawData, selectedPeriod, selectedAgent, searchValue]);

    // 7) Агрегация (groupBy agentName + pointName), считаем accrued и payable
    const aggregatedRows: ServiceStatRow[] = useMemo(() => {
        type Key = string; // "agentName||pointName"
        const map = new Map<Key, Omit<ServiceStatRow, "accrued" | "payable">>();

        filteredEvents.forEach((row) => {
            const key: Key = `${row.agentName}||${row.pointName}`;
            if (!map.has(key)) {
                map.set(key, {
                    agentName: row.agentName,
                    pointName: row.pointName,
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
            const payable = parseFloat(((accrued * percent) / 100).toFixed(2));

            result.push({
                ...vals,
                accrued,
                payable,
            });
        });

        return result;
    }, [filteredEvents, percent]);

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

    // 9) Итоги «ИТОГО начислено» (по последним 4 действиям)
    const accruedTotals = useMemo(() => {
        const trialAcc = totals.trialGenerations * WEIGHTS.trialGenerations;
        const purchAcc = totals.purchasedSongs * WEIGHTS.purchasedSongs;
        const poemAcc = totals.poemOrders * WEIGHTS.poemOrders;
        const videoAcc = totals.videoOrders * WEIGHTS.videoOrders;
        const sum = trialAcc + purchAcc + poemAcc + videoAcc;
        return { trialAcc, purchAcc, poemAcc, videoAcc, sum };
    }, [totals]);

    // 10) Итоги «ИТОГО к выплате» (на основе accruedTotals.sum и percent)
    const totalPayable = useMemo(() => {
        return parseFloat(((accruedTotals.sum * percent) / 100).toFixed(2));
    }, [accruedTotals.sum, percent]);

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
                header: "Точка продаж",
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

    // 12) Обработка загрузки / ошибки
    if (loading) return <Skeleton className="h-[350px] w-full" />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <>
            <CardContent>
                {/* === Блок фильтров: период, консультанты, поиск, процент === */}
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

                    {/* Поиск */}
                    <Input
                        placeholder="Поиск по консультанту или точке..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />

                    <Input
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
                    />
                </div>

                {/* === Таблица итогов === */}
                <Table className="mb-6">
                    <TableBody>
                        {/* ИТОГО количество */}
                        <TableRow className="bg-gray-100 font-medium">
                            <TableCell colSpan={1}>ИТОГО количество:</TableCell>
                            <TableCell colSpan={1}></TableCell>
                            <TableCell colSpan={1} className="text-center">{totals.newClients}</TableCell>
                            <TableCell colSpan={1} className="text-center">{totals.songGenerations}</TableCell>
                            <TableCell colSpan={1} className="text-center">{totals.trialGenerations}</TableCell>
                            <TableCell colSpan={1} className="text-center">{totals.purchasedSongs}</TableCell>
                            <TableCell colSpan={1} className="text-center">{totals.poemOrders}</TableCell>
                            <TableCell colSpan={1} className="text-center">{totals.videoOrders}</TableCell>
                        </TableRow>

                        {/* ИТОГО начислено */}
                        <TableRow className="bg-gray-100 font-medium">
                            <TableCell colSpan={1}>ИТОГО начислено:</TableCell>
                            <TableCell colSpan={3}></TableCell>
                            <TableCell className="text-center">{accruedTotals.trialAcc}</TableCell>
                            <TableCell className="text-center">{accruedTotals.purchAcc}</TableCell>
                            <TableCell className="text-center">{accruedTotals.poemAcc}</TableCell>
                            <TableCell className="text-center">{accruedTotals.videoAcc}</TableCell>
                        </TableRow>

                        {/* ИТОГО к выплате */}
                        <TableRow className="bg-gray-100 font-medium">
                            <TableCell colSpan={7}>ИТОГО к выплате:</TableCell>
                            <TableCell colSpan={1} className="text-center">{totalPayable}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {/* === Основная таблица данных === */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Консультант</TableHead>
                            <TableHead>Точка продаж</TableHead>
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
                        {table.getRowModel().rows?.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
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
            </CardContent>
        </>
    );
}
