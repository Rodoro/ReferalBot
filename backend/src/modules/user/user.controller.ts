import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserResponseDto } from "./dto/user-response.dto";
import { Authorized } from "@/src/shared/decorators/authorized.decorator";
import { UserService } from "./user.service";
import { Authorization } from "@/src/shared/decorators/auth.decorator";
import { BotAuthorization } from "@/src/shared/decorators/bot-auth.decorator";
import { CreateUserDto } from "./dto/create-user.dto";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @BotAuthorization()
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

}