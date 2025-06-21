import { Exclude, Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

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
}