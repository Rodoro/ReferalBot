import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SalesPointService } from './sales-point.service';
import { CreateSalesPointDto } from './dto/create-sales-point.dto';
import { UpdateSalesPointDto } from './dto/update-sales-point.dto';
import { SalesPointResponseDto } from './dto/sales-point-response.dto';
import { BotAuthorization } from '@/src/shared/decorators/bot-auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { Authorization } from '@/src/shared/decorators/auth.decorator';

@ApiTags('SalesPoint')
@Controller('sales-point')
export class SalesPointController {
    constructor(private readonly spService: SalesPointService) { }

    @Post('bot')
    @BotAuthorization()
    @ApiOperation({ summary: 'Create sales point' })
    @ApiResponse({ status: 201, type: SalesPointResponseDto })
    createBot(@Body() dto: CreateSalesPointDto): Promise<SalesPointResponseDto> {
        return this.spService.create(dto);
    }

    @Post('user')
    @ApiOperation({ summary: 'Create sales point' })
    @ApiResponse({ status: 201, type: SalesPointResponseDto })
    create(@Body() dto: CreateSalesPointDto): Promise<SalesPointResponseDto> {
        return this.spService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sales points' })
    findAll(): Promise<SalesPointResponseDto[]> {
        return this.spService.findAll();
    }

    @Get('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Get sales point by id' })
    findOneBot(@Param('id') id: string): Promise<SalesPointResponseDto> {
        return this.spService.findOne(+id);
    }

    @Get('ref/:code')
    @ApiOperation({ summary: 'Get sales point by referral code' })
    findByCode(@Param('code') code: string): Promise<SalesPointResponseDto> {
        return this.spService.findByReferralCode(code);
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'Get sales point by id' })
    findOne(@Param('id') id: string): Promise<SalesPointResponseDto> {
        return this.spService.findOne(+id);
    }

    @Put('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Update sales point by id' })
    updateBot(@Param('id') id: string, @Body() dto: UpdateSalesPointDto): Promise<SalesPointResponseDto> {
        return this.spService.update(+id, dto);
    }

    @Put('user/:id')
    @Authorization()
    @ApiOperation({ summary: 'Update sales point by id' })
    update(
        @Authorized('id') userId: number,
        @Param('id') id: string,
        @Body() dto: UpdateSalesPointDto,
    ): Promise<SalesPointResponseDto> {
        if (userId !== +id) {
            throw new ForbiddenException('Cannot edit another user sales point');
        }
        return this.spService.update(+id, dto);
    }

    @Delete('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Delete sales point by id' })
    removeBot(@Param('id') id: string): Promise<SalesPointResponseDto> {
        return this.spService.remove(+id);
    }

    @Delete('user/:id')
    @ApiOperation({ summary: 'Delete sales point by id' })
    remove(@Param('id') id: string): Promise<SalesPointResponseDto> {
        return this.spService.remove(+id);
    }

    @Get('agent/:id')
    @ApiOperation({ summary: 'Get sales points by agent id' })
    findByAgent(@Param('id') id: string) {
        return this.spService.findByAgent(+id);
    }

    @Get('agent/:id/outlets')
    @ApiOperation({ summary: 'Get sales points with outlets by agent id' })
    findByAgentWithOutlets(@Param('id') id: string) {
        return this.spService.findByAgentWithOutlets(+id);
    }
}