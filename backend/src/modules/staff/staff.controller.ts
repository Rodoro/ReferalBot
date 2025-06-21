import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { StaffResponseDto } from './dto/staff-response.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Post()
    @ApiOperation({ summary: 'Create staff member' })
    @ApiResponse({ status: 201, type: StaffResponseDto })
    create(@Body() dto: CreateStaffDto): Promise<StaffResponseDto> {
        return this.staffService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all staff members' })
    @ApiResponse({ status: 200, type: [StaffResponseDto] })
    findAll(): Promise<StaffResponseDto[]> {
        return this.staffService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get staff member by id' })
    @ApiResponse({ status: 200, type: StaffResponseDto })
    async findOne(@Param('id') id: string): Promise<StaffResponseDto> {
        return this.staffService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update staff member by id' })
    @ApiResponse({ status: 200, type: StaffResponseDto })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateStaffDto,
    ): Promise<StaffResponseDto> {
        return this.staffService.update(+id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete staff member by id' })
    @ApiResponse({ status: 200, type: StaffResponseDto })
    async remove(@Param('id') id: string): Promise<StaffResponseDto> {
        return this.staffService.remove(+id);
    }
}