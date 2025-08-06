import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { DailyStatDto } from './dto/daily-stat.dto';
import { ArchitectureAgentDto } from './dto/architecture.dto';
import { PayoutDto } from './dto/payout.dto';
import { Response } from 'express';
import * as XLSX from 'xlsx';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('daily')
    @ApiOperation({ summary: 'Get daily statistics' })
    getDaily(): Promise<DailyStatDto[]> {
        return this.statisticsService.getDaily();
    }

    @Get('agent/:id/daily')
    @ApiOperation({ summary: 'Get daily statistics for agent' })
    getDailyByAgent(@Param('id') id: string): Promise<DailyStatDto[]> {
        return this.statisticsService.getDailyByAgent(+id);
    }

    @Get('sales-point/:id/daily')
    @ApiOperation({ summary: 'Get daily statistics for sales point' })
    getDailyBySalesPoint(@Param('id') id: string): Promise<DailyStatDto[]> {
        return this.statisticsService.getDailyBySalesPoint(+id);
    }

    @Get('sales-outlet/:id/daily')
    @ApiOperation({ summary: 'Get daily statistics for sales outlet' })
    getDailyBySalesOutlet(@Param('id') id: string): Promise<DailyStatDto[]> {
        return this.statisticsService.getDailyBySalesOutlet(+id);
    }

    @Get('architecture')
    @ApiOperation({ summary: 'Get architecture data' })
    getArchitecture(@Query('includeUnknown') includeUnknown = 'false'): Promise<ArchitectureAgentDto[]> {
        return this.statisticsService.getArchitecture(includeUnknown === 'true');
    }

    @Get('payouts')
    @ApiOperation({ summary: 'Get payouts for period' })
    getPayouts(
        @Query('month') month?: string,
        @Query('year') year?: string,
    ): Promise<PayoutDto[]> {
        const m = month ? parseInt(month, 10) : undefined;
        const y = year ? parseInt(year, 10) : undefined;
        return this.statisticsService.getPayouts(m, y);
    }

    @Get('payouts/export')
    @ApiOperation({ summary: 'Export payouts for period' })
    async exportPayouts(
        @Res({ passthrough: true }) res: Response,
        @Query('month') month?: string,
        @Query('year') year?: string,
        @Query('format') format: 'xml' | 'json' | 'csv' | 'xlsx' = 'xlsx',
    ) {
        const m = month ? parseInt(month, 10) : undefined;
        const y = year ? parseInt(year, 10) : undefined;
        const payouts = await this.statisticsService.getPayouts(m, y);

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', 'attachment; filename="payouts.json"');
            res.send(JSON.stringify(payouts));
            return;
        }

        if (format === 'csv') {
            const ws = XLSX.utils.json_to_sheet(payouts);
            const csv = XLSX.utils.sheet_to_csv(ws);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="payouts.csv"');
            res.send(csv);
            return;
        }

        if (format === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet(payouts);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Payouts');
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="payouts.xlsx"');
            res.send(buffer);
            return;
        }

        const items = payouts
            .map(
                (p) =>
                    `  <payout>\n    <type>${p.businessType}</type>\n    <fullName>${p.fullName}</fullName>\n    <inn>${p.inn}</inn>\n    <bik>${p.bik ?? ''}</bik>\n    <bankName>${p.bankName ?? ''}</bankName>\n    <account>${p.account ?? ''}</account>\n    <paymentPurpose>${p.paymentPurpose}</paymentPurpose>\n  </payout>`,
            )
            .join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<payouts>\n${items}\n</payouts>`;
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', 'attachment; filename="payouts.xml"');
        res.send(xml);
    }
}