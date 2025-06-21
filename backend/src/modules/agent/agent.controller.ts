import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentResponseDto } from './dto/agent-response.dto';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
    constructor(private readonly agentService: AgentService) { }

    @Post()
    @ApiOperation({ summary: 'Create agent' })
    @ApiResponse({ status: 201, type: AgentResponseDto })
    create(@Body() dto: CreateAgentDto): Promise<AgentResponseDto> {
        return this.agentService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all agents' })
    findAll(): Promise<AgentResponseDto[]> {
        return this.agentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get agent by id' })
    async findOne(@Param('id') id: string): Promise<AgentResponseDto> {
        return this.agentService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update agent by id' })
    async update(@Param('id') id: string, @Body() dto: UpdateAgentDto): Promise<AgentResponseDto> {
        return this.agentService.update(+id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete agent by id' })
    async remove(@Param('id') id: string): Promise<AgentResponseDto> {
        return this.agentService.remove(+id);
    }
}