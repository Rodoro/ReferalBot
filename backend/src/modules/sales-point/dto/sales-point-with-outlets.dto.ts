import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SalesOutletResponseDto } from '../../sales-outlet/dto/sales-outlet-response.dto';
import { SalesPointResponseDto } from './sales-point-response.dto';

export class SalesPointWithOutletsDto extends SalesPointResponseDto {
    @ApiProperty({ type: () => [SalesOutletResponseDto] })
    @Expose()
    @Type(() => SalesOutletResponseDto)
    outlets: SalesOutletResponseDto[];
}