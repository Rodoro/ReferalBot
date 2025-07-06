import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { DailyStatDto } from './dto/daily-stat.dto';
import { ArchitectureAgentDto } from './dto/architecture.dto';

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

    @Get('architecture')
    @ApiOperation({ summary: 'Get architecture data' })
    getArchitecture(): Promise<ArchitectureAgentDto[]> {
        return this.statisticsService.getArchitecture();
    }
}