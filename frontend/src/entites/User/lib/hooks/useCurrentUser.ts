"use client"
import { useAuth } from '@/entites/Auth/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { User } from '../../types/user.types'
import { userApi } from '../api/user.api'
import { userStore } from '../store/user.store'
import { authStore } from '@/entites/Auth/lib/store/auth.store'

let pendingFetch: Promise<User> | null = null

export const useCurrentUser = () => {
    const { isAuthenticated } = useAuth()
    const { user, setUser, clearUser } = userStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false)

    const refetch = async () => {
        if (!isAuthenticated) return

        if (!pendingFetch) {
            setIsLoading(true)
            pendingFetch = userApi
                .getCurrent()
                .then((currentUser) => {
                    setUser(currentUser)
                    return currentUser
                })
                .finally(() => {
                    pendingFetch = null
                    setIsLoading(false)
                })
        }

        return pendingFetch
    }

    useEffect(() => {
        function checkHydrated() {
            return userStore.persist.hasHydrated() && authStore.persist.hasHydrated()
        }

        const unsubUser = userStore.persist.onFinishHydration(() => {
            if (checkHydrated()) setIsHydrated(true)
        })
        const unsubAuth = authStore.persist.onFinishHydration(() => {
            if (checkHydrated()) setIsHydrated(true)
        })

        if (checkHydrated()) setIsHydrated(true)

        return () => {
            unsubUser()
            unsubAuth()
        }
    }, [])

    useEffect(() => {
        if (!isHydrated) return

        if (!isAuthenticated) {
            clearUser()
            return
        }

        if (!user) {
            refetch()
        }
    }, [isAuthenticated, isHydrated])

    return {
        user,
        isLoading,
        refetch
    }
}