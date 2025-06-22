import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VideoEditorService } from './video-editor.service';
import { CreateVideoEditorDto } from './dto/create-video-editor.dto';
import { UpdateVideoEditorDto } from './dto/update-video-editor.dto';
import { VideoEditorResponseDto } from './dto/video-editor-response.dto';
import { BotAuthorization } from '@/src/shared/decorators/bot-auth.decorator';

@ApiTags('VideoEditor')
@Controller('video-editor')
export class VideoEditorController {
    constructor(private readonly veService: VideoEditorService) { }

    @Post('bot')
    @BotAuthorization()
    @ApiOperation({ summary: 'Create video editor' })
    @ApiResponse({ status: 201, type: VideoEditorResponseDto })
    createBot(@Body() dto: CreateVideoEditorDto): Promise<VideoEditorResponseDto> {
        return this.veService.create(dto);
    }

    @Post('user')
    @ApiOperation({ summary: 'Create video editor' })
    @ApiResponse({ status: 201, type: VideoEditorResponseDto })
    create(@Body() dto: CreateVideoEditorDto): Promise<VideoEditorResponseDto> {
        return this.veService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all video editors' })
    findAll(): Promise<VideoEditorResponseDto[]> {
        return this.veService.findAll();
    }

    @Get('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Get video editor by id' })
    findOneBot(@Param('id') id: string): Promise<VideoEditorResponseDto> {
        return this.veService.findOne(+id);
    }

    @Get('user/:id')
    @ApiOperation({ summary: 'Get video editor by id' })
    findOne(@Param('id') id: string): Promise<VideoEditorResponseDto> {
        return this.veService.findOne(+id);
    }

    @Put('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Update video editor by id' })
    updateBot(@Param('id') id: string, @Body() dto: UpdateVideoEditorDto): Promise<VideoEditorResponseDto> {
        return this.veService.update(+id, dto);
    }

    @Put('user/:id')
    @ApiOperation({ summary: 'Update video editor by id' })
    update(@Param('id') id: string, @Body() dto: UpdateVideoEditorDto): Promise<VideoEditorResponseDto> {
        return this.veService.update(+id, dto);
    }

    @Delete('bot/:id')
    @BotAuthorization()
    @ApiOperation({ summary: 'Delete video editor by id' })
    removeBot(@Param('id') id: string): Promise<VideoEditorResponseDto> {
        return this.veService.remove(+id);
    }

    @Delete('user/:id')
    @ApiOperation({ summary: 'Delete video editor by id' })
    remove(@Param('id') id: string): Promise<VideoEditorResponseDto> {
        return this.veService.remove(+id);
    }
}