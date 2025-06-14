import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AuthStore } from '../../types/auth.types'

export const authStore = create(
    persist<AuthStore>(
        (set) => ({
            isAuthenticated: false,
            setIsAuthenticated: (value) => set({ isAuthenticated: value }),
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => localStorage),
        }
    )
)