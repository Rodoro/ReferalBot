import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'

@Exclude()
export class ArchitectureUserDto {
    @ApiProperty()
    @Expose()
    chatId: string

    @ApiProperty({ required: false })
    @Expose()
    username?: string | null

    @ApiProperty()
    @Expose()
    songGenerations: number

    @ApiProperty()
    @Expose()
    textGenerations: number
}

@Exclude()
export class ArchitectureOutletDto {
    @ApiProperty()
    @Expose()
    id: number

    @ApiProperty()
    @Expose()
    name: string

    @ApiProperty()
    @Expose()
    verified: boolean

    @ApiProperty({ type: () => [ArchitectureUserDto] })
    @Expose()
    @Type(() => ArchitectureUserDto)
    users: ArchitectureUserDto[]

    @ApiProperty()
    @Expose()
    userCount: number

    @ApiProperty()
    @Expose()
    songGenerations: number

    @ApiProperty()
    @Expose()
    textGenerations: number
}

@Exclude()
export class ArchitecturePartnerDto {
    @ApiProperty()
    @Expose()
    id: number

    @ApiProperty()
    @Expose()
    fullName: string

    @ApiProperty({ type: () => [ArchitectureOutletDto] })
    @Expose()
    @Type(() => ArchitectureOutletDto)
    outlets: ArchitectureOutletDto[]

    @ApiProperty()
    @Expose()
    userCount: number

    @ApiProperty()
    @Expose()
    songGenerations: number

    @ApiProperty()
    @Expose()
    textGenerations: number
}

@Exclude()
export class ArchitectureAgentDto {
    @ApiProperty()
    @Expose()
    id: number

    @ApiProperty()
    @Expose()
    fullName: string

    @ApiProperty({ type: () => [ArchitecturePartnerDto] })
    @Expose()
    @Type(() => ArchitecturePartnerDto)
    partners: ArchitecturePartnerDto[]

    @ApiProperty()
    @Expose()
    userCount: number

    @ApiProperty()
    @Expose()
    songGenerations: number

    @ApiProperty()
    @Expose()
    textGenerations: number
}