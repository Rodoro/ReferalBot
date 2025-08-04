import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PayoutDto {
    @ApiProperty()
    @Expose()
    type: string;

    @ApiProperty()
    @Expose()
    fullName: string;

    @ApiProperty()
    @Expose()
    inn: string;

    @ApiProperty({ required: false })
    @Expose()
    bik?: string | null;

    @ApiProperty({ required: false })
    @Expose()
    bankName?: string | null;

    @ApiProperty({ required: false })
    @Expose()
    account?: string | null;

    @ApiProperty()
    @Expose()
    paymentPurpose: string;
}