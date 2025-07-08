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
}