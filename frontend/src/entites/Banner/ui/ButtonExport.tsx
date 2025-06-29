'use client'
import { Button } from '@/shared/ui/form/button'
import React from 'react'
import { bannerApi } from '../lib/api/banner-api'
import { Download } from 'lucide-react'

export default function ButtonExport() {
    const handleExport = async () => {
        const blob = await bannerApi.exportXml()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'banners.xml'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Button variant='outline' className='min-w-56' onClick={handleExport}><Download />Экспорт</Button>
    )
}
