import { toast } from 'sonner'

export const apiClient = {
    async request<T>(url: string, config: RequestInit = {}): Promise<T> {
        try {
            const headers = new Headers({
                Accept: 'application/json',
                ...(config.headers || {})
            })
            if (config.body && !(config.body instanceof FormData) && !headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json')
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}${url}`, {
                ...config,
                headers,
            })
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

    get<T>(url: string): Promise<T> {
        return this.request(url, { method: 'GET' })
    },

    post<T>(url: string, body?: unknown): Promise<T> {
        const isFormData = body instanceof FormData
        return this.request(url, {
            method: 'POST',
            body: isFormData ? body : JSON.stringify(body),
        })
    },

    put<T>(url: string, body: unknown): Promise<T> {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body),
        })
    },

    delete<T>(url: string): Promise<T> {
        return this.request(url, { method: 'DELETE' })
    },
}