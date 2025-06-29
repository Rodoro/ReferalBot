'use client'
import { Button } from '@/shared/ui/form/button'
import React from 'react'
import { bannerApi } from '../lib/api/banner-api'
import { Download } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/shared/ui/form/dropdown-menu'

export default function ButtonExport() {
    const handleExport = async (format: 'xml' | 'json' | 'csv' | 'xlsx') => {
        const blob = await bannerApi.export(format)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `banners.${format}`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' className='min-w-56'><Download />Экспорт</Button>
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