import { ApiProperty } from '@nestjs/swagger';
import { InputJsonValue } from '@prisma/client/runtime/library';

export class CreateBannerDto {
    @ApiProperty()
    qrTopOffset: number;

    @ApiProperty()
    qrLeftOffset: number;

    @ApiProperty()
    qrSize: number;

    @ApiProperty()
    width: number;

    @ApiProperty()
    height: number;

    @ApiProperty({ required: false, type: Object })
    qrOptions?: InputJsonValue;
}