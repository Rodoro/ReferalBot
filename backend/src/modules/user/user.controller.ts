import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserResponseDto } from "./dto/user-response.dto";
import { Authorized } from "@/src/shared/decorators/authorized.decorator";
import { UserService } from "./user.service";
import { Authorization } from "@/src/shared/decorators/auth.decorator";

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

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