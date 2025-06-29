import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Create banner' })
    create(
        @UploadedFile() file: Express.Multer.File,
        @Body() createBannerDto: CreateBannerDto,
    ) {
        return this.bannersService.create(createBannerDto, file);
    }

    @Get()
    @ApiOperation({ summary: 'Get all banners' })
    findAll() {
        return this.bannersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get banner by id' })
    findOne(@Param('id') id: string) {
        return this.bannersService.findOne(+id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Update banner by id' })
    update(
        @Param('id') id: string,
        @Body() updateBannerDto: UpdateBannerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.bannersService.update(+id, updateBannerDto, file);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete banner by id' })
    remove(@Param('id') id: string) {
        return this.bannersService.remove(+id);
    }

    @Post(':id/duplicate')
    @ApiOperation({ summary: 'Duplicate banner by id' })
    duplicate(@Param('id') id: string) {
        return this.bannersService.duplicate(+id);
    }
}