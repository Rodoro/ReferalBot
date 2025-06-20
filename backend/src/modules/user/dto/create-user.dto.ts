import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from '@prisma/generated';

export class CreateUserDto {
  @ApiProperty()
  displayName: string;

  @ApiProperty()
  telegramTeg: string;

  @ApiProperty()
  telegramId: string;

  @ApiProperty({ enum: RoleType })
  role: RoleType;
}