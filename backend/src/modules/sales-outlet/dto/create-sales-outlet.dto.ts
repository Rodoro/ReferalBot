import { OutletType } from '@/prisma/generated';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSalesOutletDto {
    @ApiProperty({ description: 'Partner id' })
    partnerId: number;

    @ApiProperty({ required: false })
    address?: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: OutletType, required: false, default: OutletType.SELLER })
    type?: OutletType;

    @ApiProperty({ required: false })
    telegramId?: string;

    @ApiProperty({ required: false })
    link?: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ required: false })
    verified?: boolean;

    @ApiProperty({ required: false })
    referralCode?: string;
}