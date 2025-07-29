import { OutletType } from '@/prisma/generated';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class DailyStatDto {
    @ApiProperty()
    @Expose()
    date: string;

    @ApiProperty()
    @Expose()
    agentName: string;

    @ApiProperty()
    @Expose()
    pointName: string;


    @ApiProperty({ required: false })
    @Expose()
    outletName?: string;

    @ApiProperty({ enum: OutletType, required: false })
    @Expose()
    outletType?: OutletType;

    @ApiProperty()
    @Expose()
    newClients: number;

    @ApiProperty()
    @Expose()
    songGenerations: number;

    @ApiProperty()
    @Expose()
    trialGenerations: number;

    @ApiProperty()
    @Expose()
    purchasedSongs: number;

    @ApiProperty()
    @Expose()
    poemOrders: number;

    @ApiProperty()
    @Expose()
    videoOrders: number;

    @ApiProperty()
    @Expose()
    toPay: number;
}