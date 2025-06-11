import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { LoginStaffDto } from './dto/login-staff.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StaffResponseDto } from '../staff/dto/staff-response.dto';
import { Request } from 'express';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { ErrorResponseDto } from '@/src/shared/dto/error-response.dto';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import { SessionDto } from './dto/session.dto';

@ApiTags('Session')
@Controller('session')
export class SessionController {
    constructor(private readonly sessionService: SessionService) { }

    @Post('login')
    @ApiOperation({ summary: 'Staff login' })
    @ApiBody({ type: LoginStaffDto })
    @ApiResponse({
        status: 200,
        description: 'Successfully logged in',
        type: StaffResponseDto
    })
    @ApiResponse({
        status: 400,
        description: 'Ошибки валидации',
        type: ErrorResponseDto
    })
    @ApiResponse({
        status: 401,
        description: 'Неверные учетные данные',
        type: ErrorResponseDto
    })
    @ApiResponse({ status: 404, description: 'User not found or invalid password' })
    async login(
        @Req() req: Request,
        @Body() loginStaffDto: LoginStaffDto,
        @UserAgent() UserAgent: string
    ) {
        return this.sessionService.login(req, loginStaffDto, UserAgent);
    }

    @Post('logout')
    @Authorization()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Staff logout' })
    @ApiResponse({ status: 200, description: 'Successfully logged out' })
    async logout(@Req() req: Request) {
        return this.sessionService.logout(req);
    }

    @Authorization()
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all user sessions' })
    @ApiResponse({ status: 200, description: 'List of sessions', type: [SessionDto] })
    async findByUser(@Req() req: Request) {
        return this.sessionService.findByUser(req);
    }

    @Authorization()
    @Get('current')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current session' })
    @ApiResponse({ status: 200, description: 'Current session', type: SessionDto })
    async findCurrent(@Req() req: Request) {
        return this.sessionService.findCurrent(req);
    }

    @Post('clear')
    @ApiOperation({ summary: 'Clear session cookie' })
    @ApiResponse({ status: 200, description: 'Session cookie cleared' })
    async clearSession(@Req() req: Request) {
        return this.sessionService.clearSession(req);
    }

    @Authorization()
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove session by ID' })
    @ApiResponse({ status: 200, description: 'Session removed' })
    async remove(@Req() req: Request, @Param('id') id: string) {
        return this.sessionService.remove(req, id);
    }
}