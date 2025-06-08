import { ApiProperty } from '@nestjs/swagger';

export class CreateBannerDto {
    @ApiProperty()
    imageUrl: string;

    @ApiProperty()
    qrTopOffset: number;

    @ApiProperty()
    qrLeftOffset: number;

    @ApiProperty()
    qrSize: number;
}