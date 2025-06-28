import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TelegramService {
    constructor(private readonly configService: ConfigService) { }

    async removeKeyboard(chatId: string, messageId: number): Promise<void> {
        const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        if (!token) {
            return;
        }
        const url = `https://api.telegram.org/bot${token}/editMessageReplyMarkup`;
        try {
            await axios.post(url, {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: {},
            });
        } catch (err) {
            console.log(err)
        }
    }
}