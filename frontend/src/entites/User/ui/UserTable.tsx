'use client'

import { useEffect, useState } from 'react'
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import { userApi } from '../lib/api/user.api'
import { User, getUserRoles } from '../types/user.types'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table'
import { Input } from '@/shared/ui/form/input'
import { Button } from '@/shared/ui/form/button'
import { Skeleton } from '@/shared/ui/branding/skeleton'
import { ArrowUpDown, Trash, Eraser } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/branding/avatar'
import { Badge } from '@/shared/ui/branding/badge'

export default function UserTable() {
    const [data, setData] = useState<(User & { searchText: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [deleting, setDeleting] = useState<number | null>(null)

    useEffect(() => {
        userApi
            .getAll()
            .then(res => {
                const prepared = res.map(u => ({
                    ...u,
                    searchText: `${u.displayName} ${u.telegramTeg}`.toLowerCase(),
                }))
                setData(prepared)
            })
            .catch(() => setError('Ошибка загрузки данных'))
            .finally(() => setLoading(false))
    }, [])

    const router = useRouter()

    const handleDelete = async (id: number) => {
        try {
            setDeleting(id)
            await userApi.delete(id)
            setData((prev) => prev.filter((u) => u.id !== id))
            toast.success('Пользователь удален')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error)
            toast.error('Не удалось удалить пользователя')
        } finally {
            setDeleting(null)
        }
    }

    const handleClear = async (id: number) => {
        try {
            await userApi.clear(id)
            toast.success('Данные пользователя очищены')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error)
            toast.error('Не удалось очистить данные пользователя')
        }
    }

    const columns: ColumnDef<(User & { searchText: string })>[] = [
        {
            accessorKey: 'avatar',
            header: () => <div className="text-center">Аватар</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Avatar className="h-8 w-8 rounded-lg">
                        {row.original.avatar ? (
                            <AvatarImage src={row.original.avatar} alt={row.original.displayName} />
                        ) : (
                            <AvatarFallback className="rounded-lg bg-blue-400 text-white">{row.original.displayName[0]}</AvatarFallback>
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
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClear(row.original.id)
                        }}
                    >
                        <Eraser className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(row.original.id)
                        }}
                    >
                        <Trash className="size-4" />
                    </Button>
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    })

    if (loading) return <Skeleton className="h-[300px] w-full" />
    if (error) return <div className="text-red-500 p-4">{error}</div>

    return (
        <div className="flex flex-col gap-4">
            <Input
                placeholder="Поиск по имени или телеграму..."
                // value={globalFilter ?? ''}
                onChange={(event) => {
                    const value = event.target.value.toLowerCase()
                    setGlobalFilter(value)
                    // table.getColumn('searchText')?.setFilterValue(value)
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => router.push(`/users/${row.original.id}`)}
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
        </div >
    )
}