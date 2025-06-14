"use client"
import { useAuth } from '@/entites/Auth/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { User } from '../../types/user.types'
import { userApi } from '../api/user.api'

export const useCurrentUser = () => {
    const { isAuthenticated, logout } = useAuth()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const refetch = async () => {
        if (!isAuthenticated) return

        setIsLoading(true)
        try {
            const currentStaff = await userApi.getCurrent()
            setUser(currentStaff)
            return currentStaff
        } catch (err) {
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!isAuthenticated) {
            setUser(null)
            return
        }

        refetch()
    }, [isAuthenticated])

    useEffect(() => {
        if (!isAuthenticated) {
            // logout()
        }
    }, [isAuthenticated, logout])

    return {
        user,
        isLoading,
        refetch
    }
}