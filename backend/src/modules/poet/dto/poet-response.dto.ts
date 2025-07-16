import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class PoetResponseDto {
    @ApiProperty({ example: 1, description: 'Poet id' })
    @Expose()
    id: number;

    @ApiProperty({ description: 'Related user id' })
    @Expose()
    userId: number;

    @ApiProperty({ description: 'Telegram id' })
    @Expose()
    telegramId: string;

    @ApiProperty()
    @Expose()
    fullName: string;

    @ApiProperty()
    @Expose()
    city: string;

    @ApiProperty()
    @Expose()
    inn: string;

    @ApiProperty()
    @Expose()
    phone: string;

    @ApiProperty()
    @Expose()
    businessType: string;

    @ApiProperty({ required: false })
    @Expose()
    bik?: string | null;

    @ApiProperty({ required: false })
    @Expose()
    account?: string | null;

    @ApiProperty({ required: false })
    @Expose()
    bankName?: string | null;

    @ApiProperty({ required: false })
    @Expose()
    bankKs?: string | null;

    @ApiProperty()
    @Expose()
    bankDetails: string;

    @ApiProperty()
    @Expose()
    approved: boolean;

    @ApiProperty()
    @Expose()
    contractSigned: boolean;

    @ApiProperty()
    @Expose()
    registrationDate: Date;
}