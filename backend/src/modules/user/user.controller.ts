import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserResponseDto } from "./dto/user-response.dto";
import { Authorized } from "@/src/shared/decorators/authorized.decorator";
import { UserService } from "./user.service";
import { Authorization } from "@/src/shared/decorators/auth.decorator";
import { BotAuthorization } from "@/src/shared/decorators/bot-auth.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('bot')
    @BotAuthorization()
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async createIsBot(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.create(dto);
    }

    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.create(dto);
    }

    @Get('me')
    @Authorization()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user member' })
    @ApiResponse({
        status: 200,
        description: 'Staff member found',
        type: UserResponseDto
    })
    @ApiResponse({ status: 404, description: 'Staff member not found' })
    async me(@Authorized('id') id: number): Promise<UserResponseDto> {
        return this.userService.me(id);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    findAll(): Promise<UserResponseDto[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by id' })
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user by id' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.userService.update(+id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user by id' })
    async remove(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.remove(+id);
    }
}