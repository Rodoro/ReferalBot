'use client'

import { useEffect, useState } from 'react'
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { userApi } from '../lib/api/user.api'
import { User, getUserRoles } from '../types/user.types'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import { ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/branding/avatar'
import { Badge } from '@/shared/ui/branding/badge'

export default function UserTable() {
    const [data, setData] = useState<(User & { searchText: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        userApi
            .getAll()
            .then(res => {
                const prepared = res.map(u => ({
                    ...u,
                    searchText: `${u.displayName} ${u.telegramTeg} ${u.telegramId}`.toLowerCase(),
                }))
                setData(prepared)
            })
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [])

    const copyId = (id: number) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(String(id))
            toast.success('ID скопирован', { description: String(id) })
        }
    }

    const columns: ColumnDef<(User & { searchText: string })>[] = [
        {
            accessorKey: 'avatar',
            header: () => <div className="text-center">Аватар</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Avatar className="h-8 w-8">
                        {row.original.avatar ? (
                            <AvatarImage src={row.original.avatar} alt={row.original.displayName} />
                        ) : (
                            <AvatarFallback>{row.original.displayName[0]}</AvatarFallback>
                        )}
                    </Avatar>
                </div>
            ),
        },
        {
            accessorKey: 'searchText',
            header: () => null,
            cell: () => null,
        },
        {
            accessorKey: 'displayName',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Имя
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
        },
        {
            accessorKey: 'telegramTeg',
            header: 'Телеграм',
        },
        {
            accessorKey: 'telegramId',
            header: 'ID',
        },
        {
            id: 'roles',
            header: 'Роли',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {getUserRoles(row.original).map((r) => (
                        <Badge key={r} variant="outline">
                            {r}
                        </Badge>
                    ))}
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters: [{ id: 'searchText', value: globalFilter }, ...columnFilters],
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <div className="flex flex-col gap-4 p-4">
            <Input
                placeholder="Поиск по имени или тегу..."
                value={globalFilter ?? ''}
                onChange={(e) => {
                    const value = e.target.value.toLowerCase()
                    setGlobalFilter(value)
                    table.getColumn('searchText')?.setFilterValue(value)
                }}
                className="max-w-sm"
            />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => copyId(row.original.id)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Нет данных.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}