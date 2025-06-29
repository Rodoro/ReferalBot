import { PartialType } from '@nestjs/swagger';
import { CreateSalesOutletDto } from './create-sales-outlet.dto';

export class UpdateSalesOutletDto extends PartialType(CreateSalesOutletDto) { }