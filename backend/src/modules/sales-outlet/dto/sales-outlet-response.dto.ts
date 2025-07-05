import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class SalesOutletResponseDto {
    @ApiProperty({ example: 1, description: 'Sales outlet id' })
    @Expose()
    id: number;

    @ApiProperty({ description: 'Partner id' })
    @Expose()
    partnerId: number;

    @ApiProperty()
    @Expose()
    address: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty({ required: false })
    @Expose()
    description?: string | null;

    @ApiProperty()
    @Expose()
    verified: boolean;

    @ApiProperty({ required: false })
    @Expose()
    referralCode?: string | null;

    @ApiProperty()
    @Expose()
    createdAt: Date;
}