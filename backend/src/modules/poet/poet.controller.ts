import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PoetService } from './poet.service';
import { CreatePoetDto } from './dto/create-poet.dto';
import { UpdatePoetDto } from './dto/update-poet.dto';
import { PoetResponseDto } from './dto/poet-response.dto';
import { BotAuthorization } from '@/src/shared/decorators/bot-auth.decorator';

@ApiTags('Poet')
@Controller('poet')
export class PoetController {
    constructor(private readonly poetService: PoetService) { }

    @Post('bot')
    @BotAuthorization()
    @ApiOperation({ summary: 'Create poet' })
    @ApiResponse({ status: 201, type: PoetResponseDto })
    createBot(@Body() dto: CreatePoetDto): Promise<PoetResponseDto> {
        return this.poetService.create(dto);
    }

    @Post('user')
    @ApiOperation({ summary: 'Create poet' })
    @ApiResponse({ status: 201, type: PoetResponseDto })
    create(@Body() dto: CreatePoetDto): Promise<PoetResponseDto> {
        return this.poetService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all poets' })
    findAll(): Promise<PoetResponseDto[]> {
        return this.poetService.findAll();
    }

    @Get('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Get poet by id' })
    findOneBot(@Param('id') id: string): Promise<PoetResponseDto> {
        return this.poetService.findOne(+id);
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'Get poet by id' })
    findOne(@Param('id') id: string): Promise<PoetResponseDto> {
        return this.poetService.findOne(+id);
    }

    @Put('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Update poet by id' })
    updateBot(@Param('id') id: string, @Body() dto: UpdatePoetDto): Promise<PoetResponseDto> {
        return this.poetService.update(+id, dto);
    }

    @Put('user/:id')
    @ApiOperation({ summary: 'Update poet by id' })
    update(@Param('id') id: string, @Body() dto: UpdatePoetDto): Promise<PoetResponseDto> {
        return this.poetService.update(+id, dto);
    }

    @Delete('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Delete poet by id' })
    removeBot(@Param('id') id: string): Promise<PoetResponseDto> {
        return this.poetService.remove(+id);
    }

    @Delete('user/:id')
    @ApiOperation({ summary: 'Delete poet by id' })
    remove(@Param('id') id: string): Promise<PoetResponseDto> {
        return this.poetService.remove(+id);
    }
}