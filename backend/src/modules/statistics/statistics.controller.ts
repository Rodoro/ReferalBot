import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { DailyStatDto } from './dto/daily-stat.dto';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('daily')
    @ApiOperation({ summary: 'Get daily statistics' })
    getDaily(): Promise<DailyStatDto[]> {
        return this.statisticsService.getDaily();
    }
}