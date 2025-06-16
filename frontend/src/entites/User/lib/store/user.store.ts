import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User } from '../../types/user.types'

export interface UserStore {
    user: User | null
    setUser: (user: User) => void
    clearUser: () => void
}

export const userStore = create(
    persist<UserStore>(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user',
            storage: createJSONStorage(() => localStorage),
        }
    )
)