import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Post()
    @ApiOperation({ summary: 'Create banner' })
    create(@Body() createBannerDto: CreateBannerDto) {
        return this.bannersService.create(createBannerDto);
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
    @ApiOperation({ summary: 'Update banner by id' })
    update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
        return this.bannersService.update(+id, updateBannerDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete banner by id' })
    remove(@Param('id') id: string) {
        return this.bannersService.remove(+id);
    }
}