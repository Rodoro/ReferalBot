'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPayouts, Payout } from '../lib/api/payout-api';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/shared/ui/branding/table';
import { Skeleton } from '@/shared/ui/branding/skeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/form/select';

interface Period {
    month: number;
    year: number;
}

function getDefaultPeriod(): Period {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { month: prev.getMonth() + 1, year: prev.getFullYear() };
}

export function PayoutTable() {
    const defaultPeriod = useMemo(() => getDefaultPeriod(), []);
    const [period, setPeriod] = useState<Period>(defaultPeriod);
    const [data, setData] = useState<Payout[]>([]);
    const [loading, setLoading] = useState(true);

    const periods = useMemo(() => {
        const arr: Period & { label: string }[] = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
            arr.push({ month: d.getMonth() + 1, year: d.getFullYear(), label: label.charAt(0).toUpperCase() + label.slice(1) });
        }
        return arr;
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await getPayouts(period.month, period.year);
                const filtered = res.filter((p) => Number(p.paymentPurpose) > 0);
                filtered.sort((a, b) => Number(b.paymentPurpose) - Number(a.paymentPurpose));
                setData(filtered);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [period]);

    const total = useMemo(() => data.reduce((sum, p) => sum + Number(p.paymentPurpose), 0), [data]);

    return (
        <div className="space-y-4">
            <Select
                value={`${period.year}-${period.month}`}
                onValueChange={(val) => {
                    const [y, m] = val.split('-').map(Number);
                    setPeriod({ month: m, year: y });
                }}
            >
                <SelectTrigger className="w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {periods.map((p) => (
                        <SelectItem key={`${p.year}-${p.month}`} value={`${p.year}-${p.month}`}>
                            {p.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {loading ? (
                <Skeleton className="h-32 w-full" />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>№</TableHead>
                            <TableHead>Вид</TableHead>
                            <TableHead>Контрагент</TableHead>
                            <TableHead>ИНН</TableHead>
                            <TableHead>БИК</TableHead>
                            <TableHead>Название банка</TableHead>
                            <TableHead>Р/СЧ</TableHead>
                            <TableHead>Назначение платежа</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="font-medium">
                            <TableCell>ИТОГО:</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                            <TableCell>{total.toLocaleString('ru-RU')}</TableCell>
                        </TableRow>
                        {data.map((p, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{p.type}</TableCell>
                                <TableCell>{`ИП ${p.fullName}`}</TableCell>
                                <TableCell>{p.inn}</TableCell>
                                <TableCell>{p.bik ?? '-'}</TableCell>
                                <TableCell>{p.bankName ?? '-'}</TableCell>
                                <TableCell>{p.account ?? '-'}</TableCell>
                                <TableCell>{p.paymentPurpose}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}