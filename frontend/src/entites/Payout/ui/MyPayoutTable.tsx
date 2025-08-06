'use client';

import { useEffect, useState } from 'react';
import { getMyPayouts } from '../lib/api/payout-api';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table';
import { Skeleton } from '@/shared/ui/branding/skeleton';

interface Row {
    month: number;
    year: number;
    label: string;
    amount: number;
}

export function MyPayoutTable() {
    const [data, setData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const now = new Date();
                const promises: Promise<Row>[] = [];
                for (let i = 0; i < 12; i++) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const month = d.getMonth() + 1;
                    const year = d.getFullYear();
                    const label = d
                        .toLocaleString('ru-RU', { month: 'long', year: 'numeric' })
                        .replace(/^./, c => c.toUpperCase());
                    promises.push(
                        getMyPayouts(month, year).then(res => ({
                            month,
                            year,
                            label,
                            amount: res.length > 0 ? Number(res[0].paymentPurpose) : 0,
                        }))
                    );
                }
                const res = await Promise.all(promises);
                res.sort((a, b) =>
                    a.year === b.year ? b.month - a.month : b.year - a.year
                );
                setData(res);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const total = data.reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="space-y-4">
            {loading ? (
                <Skeleton className="h-32 w-full" />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>№</TableHead>
                            <TableHead>Период</TableHead>
                            <TableHead>Сумма</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="font-medium">
                            <TableCell>ИТОГО:</TableCell>
                            <TableCell></TableCell>
                            <TableCell>{total.toLocaleString('ru-RU')}</TableCell>
                        </TableRow>
                        {data.map((row, idx) => (
                            <TableRow key={`${row.year}-${row.month}`}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{row.label}</TableCell>
                                <TableCell>{row.amount.toLocaleString('ru-RU')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}