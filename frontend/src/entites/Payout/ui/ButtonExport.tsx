'use client'

import { Button } from '@/shared/ui/form/button'
import { Download } from 'lucide-react'
import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/form/dropdown-menu'
import { exportPayouts } from '../lib/api/payout-api'

export default function ButtonExport({ month, year }: { month: number; year: number }) {
    const handleExport = async (format: 'xml' | 'json' | 'csv' | 'xlsx') => {
        const blob = await exportPayouts(month, year, format)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payouts.${format}`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' className='min-w-56'>
                    <Download />Экспорт
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuItem onSelect={() => handleExport('xml')}>XML</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport('json')}>JSON</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport('csv')}>CSV</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleExport('xlsx')}>XLSX</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}