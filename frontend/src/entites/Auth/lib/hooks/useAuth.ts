import { userApi } from "@/entites/User/lib/api/user.api"
import { authStore } from "../store/auth.store"
import { useCallback } from "react"


export const useAuth = () => {
    const { isAuthenticated, setIsAuthenticated } = authStore()

    const login = useCallback(async (token: string) => {
        try {
            await userApi.login(token)
            setIsAuthenticated(true)
        } catch (error) {
            throw error
        }
    }, [setIsAuthenticated])

    const logout = useCallback(async () => {
        try {
            await userApi.logout()
            setIsAuthenticated(false)
        } catch (error) {
            throw error
        }
    }, [setIsAuthenticated])

    return {
        isAuthenticated,
        login,
        logout,
    }
}