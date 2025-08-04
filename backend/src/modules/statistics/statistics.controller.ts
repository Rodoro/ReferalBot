import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { DailyStatDto } from './dto/daily-stat.dto';
import { ArchitectureAgentDto } from './dto/architecture.dto';
import { PayoutDto } from './dto/payout.dto';

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
}