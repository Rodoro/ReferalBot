import { ApiProperty } from '@nestjs/swagger';

export class CreateSalesPointDto {
    @ApiProperty({ description: 'User id' })
    userId: number;

    @ApiProperty({ description: 'Agent id' })
    agentId: number;

    @ApiProperty()
    fullName: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    inn: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    businessType: string;

    @ApiProperty({ required: false })
    bik?: string;

    @ApiProperty({ required: false })
    account?: string;

    @ApiProperty({ required: false })
    bankName?: string;

    @ApiProperty({ required: false })
    bankKs?: string;

    @ApiProperty()
    bankDetails: string;

    @ApiProperty({ required: false })
    approved?: boolean;

    @ApiProperty({ required: false })
    contractSigned?: boolean;

    @ApiProperty({ required: false })
    referralCode?: string;
}