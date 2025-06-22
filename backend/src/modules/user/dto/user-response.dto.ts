import { Exclude, Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { StaffResponseDto } from '@/src/modules/staff/dto/staff-response.dto'
import { AgentResponseDto } from '@/src/modules/agent/dto/agent-response.dto'
import { SalesPointResponseDto } from '../../sales-point/dto/sales-point-response.dto'
import { PoetResponseDto } from '../../poet/dto/poet-response.dto'

@Exclude()
export class UserResponseDto {
    @ApiProperty({ example: 1, description: 'User id' })
    @Expose()
    id: number

    @ApiProperty({ description: 'Avatar url', required: false })
    @Expose()
    avatar?: string | null

    @ApiProperty()
    @Expose()
    displayName: string

    @ApiProperty()
    @Expose()
    telegramTeg: string

    @ApiProperty()
    @Expose()
    telegramId: string

    @ApiProperty({ type: () => StaffResponseDto, required: false })
    @Expose()
    staff?: StaffResponseDto | null

    @ApiProperty({ type: () => AgentResponseDto, required: false })
    @Expose()
    agent?: AgentResponseDto | null

    @ApiProperty({ type: () => AgentResponseDto, required: false })
    @Expose()
    sales?: SalesPointResponseDto | null

    @ApiProperty({ type: () => PoetResponseDto, required: false })
    @Expose()
    poet?: PoetResponseDto | null
}