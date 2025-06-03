import { sessionApi } from '@/entites/Session/lib/api/session.api'
import { toast } from 'sonner'

export const apiClient = {
    async request<T>(url: string, config: RequestInit): Promise<T> {
        try {
            const headers = new Headers({
                'Accept': 'application/json',
                ...config.headers
            })

            if (!(config.body instanceof FormData)) {
                headers.set('Content-Type', 'application/json')
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}${url}`, {
                ...config,
                credentials: 'include',
                headers
            })

            if (response.status === 401 || response.status === 403) {
                sessionApi.terminateAll()
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.message || response.statusText)
            }

            return response.json()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unknown error')
            throw error
        }
    },

    clearSession() {
        document.cookie = 'session=; path=/; max-age=0;';
    },

    get<T>(url: string): Promise<T> {
        return this.request(url, { method: 'GET' })
    },

    post<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
        const isFormData = body instanceof FormData
        return this.request(url, {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
            headers
        })
    },

    put<T>(url: string, body: unknown): Promise<T> {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body),
        })
    },

    delete<T>(url: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
        const isFormData = body instanceof FormData
        return this.request(url, {
            method: 'DELETE',
            body: isFormData ? body : JSON.stringify(body),
            headers
        })
    },
}