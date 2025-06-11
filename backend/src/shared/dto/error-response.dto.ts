import { ApiProperty } from '@nestjs/swagger'

export class ErrorResponseDto {
    @ApiProperty({
        example: 'Неверные учетные данные',
        description: 'Сообщение об ошибке'
    })
    message: string

    @ApiProperty({
        example: ['email - должен быть email', 'password - минимум 6 символов'],
        description: 'Детали ошибок валидации',
        required: false
    })
    errors?: string[]

    @ApiProperty({
        example: 400,
        description: 'HTTP статус код ошибки'
    })
    statusCode: number

    @ApiProperty({
        example: 'Bad Request',
        description: 'Тип ошибки'
    })
    error: string
}