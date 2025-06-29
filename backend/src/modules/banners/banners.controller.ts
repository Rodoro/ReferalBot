import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UploadedFile,
    UseInterceptors,
    Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { Response } from 'express';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @Authorization()
    @ApiOperation({ summary: 'Create banner' })
    create(
        @Authorized('id') authorId: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() createBannerDto: CreateBannerDto,
    ) {
        return this.bannersService.create(createBannerDto, file, authorId);
    }

    @Get()
    @ApiOperation({ summary: 'Get all banners' })
    findAll() {
        return this.bannersService.findAll();
    }

    @Get('export')
    @ApiOperation({ summary: 'Export banners as xml' })
    async export(@Res({ passthrough: true }) res: Response) {
        const xml = await this.bannersService.exportXml();
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', 'attachment; filename="banners.xml"');
        res.send(xml);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get banner by id' })
    findOne(@Param('id') id: string) {
        return this.bannersService.findOne(+id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    @Authorization()
    @ApiOperation({ summary: 'Update banner by id' })
    update(
        @Authorized('id') authorId: number,
        @Param('id') id: string,
        @Body() updateBannerDto: UpdateBannerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.bannersService.update(+id, updateBannerDto, file, authorId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete banner by id' })
    remove(@Param('id') id: string) {
        return this.bannersService.remove(+id);
    }

    @Post(':id/duplicate')
    @Authorization()
    @ApiOperation({ summary: 'Duplicate banner by id' })
    duplicate(@Authorized('id') authorId: number, @Param('id') id: string) {
        return this.bannersService.duplicate(+id, authorId);
    }
}