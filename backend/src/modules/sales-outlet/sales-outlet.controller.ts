import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SalesOutletService } from './sales-outlet.service';
import { CreateSalesOutletDto } from './dto/create-sales-outlet.dto';
import { UpdateSalesOutletDto } from './dto/update-sales-outlet.dto';
import { SalesOutletResponseDto } from './dto/sales-outlet-response.dto';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

@ApiTags('SalesOutlet')
@Controller('sales-outlet')
export class SalesOutletController {
    constructor(private readonly outletService: SalesOutletService) { }

    @Post()
    @ApiOperation({ summary: 'Create sales outlet' })
    @ApiResponse({ status: 201, type: SalesOutletResponseDto })
    create(@Body() dto: CreateSalesOutletDto): Promise<SalesOutletResponseDto> {
        return this.outletService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sales outlets' })
    findAll(): Promise<SalesOutletResponseDto[]> {
        return this.outletService.findAll();
    }

    @Get('partner/:id')
    @ApiOperation({ summary: 'Get sales outlets by partner id' })
    findByPartner(@Param('id') id: string): Promise<SalesOutletResponseDto[]> {
        return this.outletService.findByPartner(+id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get sales outlet by id' })
    findOne(@Param('id') id: string): Promise<SalesOutletResponseDto> {
        return this.outletService.findOne(+id);
    }

    @Put(':id')
    @Authorization()
    @ApiOperation({ summary: 'Update sales outlet by id' })
    async update(
        @Authorized('id') userId: number,
        @Param('id') id: string,
        @Body() dto: UpdateSalesOutletDto,
    ): Promise<SalesOutletResponseDto> {
        const outlet = await this.outletService.findOneWithPartner(+id)
        if (outlet.partner.userId !== userId) {
            throw new ForbiddenException('Cannot edit another user sales outlet')
        }
        return this.outletService.update(+id, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete sales outlet by id' })
    remove(@Param('id') id: string): Promise<SalesOutletResponseDto> {
        return this.outletService.remove(+id);
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate sales outlets for existing partners' })
    @ApiResponse({ status: 201, description: 'Number of outlets created' })
    generateForExistingPartners(): Promise<{ created: number }> {
        return this.outletService.generateForExistingPartners();
    }
}