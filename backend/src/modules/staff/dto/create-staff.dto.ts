import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
    @ApiProperty({ description: 'User id' })
    userId: number;

    @ApiProperty()
    firstName: string;

    @ApiProperty({ required: false })
    midleName?: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty({ required: false })
    permissions?: string;
}