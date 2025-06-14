import { apiClient } from '@/shared/lib/utils/api-client';
import { User } from '../../types/user.types';

export const userApi = {
    login: async (token: string): Promise<User> => {
        return apiClient.get('/session/login-telegram?token' + token);
    },

    logout: async (): Promise<void> => {
        return apiClient.post('/session/logout');
    },

    getCurrent: async (): Promise<User> => {
        return apiClient.get('/user/me');
    },
}