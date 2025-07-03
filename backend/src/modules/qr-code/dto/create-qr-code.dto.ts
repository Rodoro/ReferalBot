import { QrType } from '@/prisma/generated';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';

export class CreateQrCodeDto {
    @ApiProperty({ enum: QrType })
    type: QrType;

    @ApiProperty()
    data: string;

    @ApiProperty({ required: false, type: Object })
    options?: InputJsonValue;
}