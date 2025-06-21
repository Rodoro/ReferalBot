import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/agent-response.dto';
import { BotAuthorization } from '@/src/shared/decorators/bot-auth.decorator';
import { SalesPointResponseDto } from '../sales-point/dto/sales-point-response.dto';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
    constructor(private readonly agentService: AgentService) { }

    @Post('bot')
    @BotAuthorization()
    @ApiOperation({ summary: 'Create agent' })
    @ApiResponse({ status: 201, type: AgentResponseDto })
    async createBot(@Body() dto: CreateAgentDto): Promise<AgentResponseDto> {
        return this.agentService.create(dto);
    }

    @Post('user')
    @ApiOperation({ summary: 'Create agent' })
    @ApiResponse({ status: 201, type: AgentResponseDto })
    async create(@Body() dto: CreateAgentDto): Promise<AgentResponseDto> {
        return this.agentService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all agents' })
    async findAll(): Promise<AgentResponseDto[]> {
        return this.agentService.findAll();
    }

    @Get('ref/:code')
    @ApiOperation({ summary: 'Get agent by referral code' })
    async findByCode(@Param('code') code: string): Promise<AgentResponseDto> {
        return this.agentService.findByReferralCode(code);
    }

    @Get('bot/:id/points')
    @BotAuthorization()
    @ApiOperation({ summary: 'Get sales points for agent' })
    async getPoints(@Param('id') id: string): Promise<SalesPointResponseDto[]> {
        return this.agentService.findSalesPoints(+id);
    }

    @Get('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Get agent by id' })
    async findOneBot(@Param('id') id: string): Promise<AgentResponseDto> {
        return this.agentService.findOne(+id);
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'Get agent by id' })
    async findOne(@Param('id') id: string): Promise<AgentResponseDto> {
        return this.agentService.findOne(+id);
    }

    @Put('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Update agent by id' })
    async updateBot(@Param('id') id: string, @Body() dto: UpdateAgentDto): Promise<AgentResponseDto> {
        return this.agentService.update(+id, dto);
    }

    @Put('user/:id')
    @ApiOperation({ summary: 'Update agent by id' })
    async update(@Param('id') id: string, @Body() dto: UpdateAgentDto): Promise<AgentResponseDto> {
        return this.agentService.update(+id, dto);
    }

    @Delete('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Delete agent by id' })
    async removeBot(@Param('id') id: string): Promise<AgentResponseDto> {
        return this.agentService.remove(+id);
    }

    @Delete('user/:id')
    @ApiOperation({ summary: 'Delete agent by id' })
    async remove(@Param('id') id: string): Promise<AgentResponseDto> {
        return this.agentService.remove(+id);
    }
}