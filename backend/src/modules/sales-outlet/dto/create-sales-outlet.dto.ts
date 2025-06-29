import { ApiProperty } from '@nestjs/swagger';

export class CreateSalesOutletDto {
    @ApiProperty({ description: 'Partner id' })
    partnerId: number;

    @ApiProperty()
    address: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    verified?: boolean;
}