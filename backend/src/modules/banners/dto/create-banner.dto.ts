import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
    @ApiProperty()
    qrTopOffset: number;

    @ApiProperty()
    qrLeftOffset: number;

    @ApiProperty()
    qrSize: number;
}