import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { QrCodeService } from './qr-code.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';

@ApiTags('qr-code')
@Controller('Qr-code')
export class QrCodeController {
    constructor(private readonly qrCodeService: QrCodeService) { }

    @Get('main')
    @ApiOperation({ summary: 'Get main QR code' })
    findMain() {
        return this.qrCodeService.findMain();
    }

    @Put('main')
    @ApiOperation({ summary: 'Update main QR code' })
    updateMain(@Body() dto: UpdateQrCodeDto) {
        return this.qrCodeService.updateMain(dto);
    }

    @Post()
    @ApiOperation({ summary: 'Create QR code' })
    create(@Body() dto: CreateQrCodeDto) {
        return this.qrCodeService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all QR codes' })
    findAll() {
        return this.qrCodeService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get QR code by id' })
    findOne(@Param('id') id: string) {
        return this.qrCodeService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update QR code by id' })
    update(@Param('id') id: string, @Body() dto: UpdateQrCodeDto) {
        return this.qrCodeService.update(+id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete QR code by id' })
    remove(@Param('id') id: string) {
        return this.qrCodeService.remove(+id);
    }
}