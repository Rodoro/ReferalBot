import { userApi } from "@/entites/User/lib/api/user.api"
import { authStore } from "../store/auth.store"


export const useAuth = () => {
    const { isAuthenticated, setIsAuthenticated } = authStore()

    const login = async (token: string) => {
        try {
            await userApi.login(token)
            setIsAuthenticated(true)
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await userApi.logout()
            setIsAuthenticated(false)
        } catch (error) {
            throw error
        }
    }

    return {
        isAuthenticated,
        login,
        logout,
    }
}