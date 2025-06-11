import { IsEmail, IsString, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginStaffDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email сотрудника для входа в систему'
    })
    @IsEmail({}, { message: 'Введите корректный email адрес' })
    email: string

    @ApiProperty({
        example: 'password123',
        description: 'Пароль сотрудника (минимум 6 символов)'
    })
    @IsString({ message: 'Пароль должен быть строкой' })
    @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
    password: string
}