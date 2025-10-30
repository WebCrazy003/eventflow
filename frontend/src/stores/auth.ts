import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { LOGIN_MUTATION, REGISTER_MUTATION, ME_QUERY } from '@/graphql/queries'
import type { User } from '@/types'
import { Role } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)

  const hasRole = computed(() => (roles: Role[]) => {
    if (!user.value) return false
    return roles.some(role => user.value!.roles.includes(role))
  })

  const isAdmin = computed(() => hasRole.value([Role.ADMIN]))
  const isOrganizer = computed(() => hasRole.value([Role.ORGANIZER, Role.ADMIN]))

  // Login mutation
  const { mutate: loginMutation } = useMutation(LOGIN_MUTATION)

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      const result = await loginMutation({
        input: { email, password },
      })

      if (result?.data?.login) {
        const { accessToken: token, refreshToken: refresh, user: userData } = result.data.login

        // Store tokens
        localStorage.setItem('accessToken', token)
        localStorage.setItem('refreshToken', refresh)

        accessToken.value = token
        refreshToken.value = refresh
        user.value = userData

        return { success: true, user: userData }
      }

      throw new Error('Login failed')
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  // Register mutation
  const { mutate: registerMutation } = useMutation(REGISTER_MUTATION)

  const register = async (name: string, email: string, password: string) => {
    isLoading.value = true
    try {
      const result = await registerMutation({
        input: { name, email, password },
      })

      if (result?.data?.register) {
        const { accessToken: token, refreshToken: refresh, user: userData } = result.data.register

        // Store tokens
        localStorage.setItem('accessToken', token)
        localStorage.setItem('refreshToken', refresh)

        accessToken.value = token
        refreshToken.value = refresh
        user.value = userData

        return { success: true, user: userData }
      }

      throw new Error('Registration failed')
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    } finally {
      isLoading.value = false
    }
  }

  // Get current user
  const { refetch: refetchUser } = useQuery(
    ME_QUERY,
    {},
    {
      enabled: false,
    }
  )

  const fetchUser = async () => {
    if (!accessToken.value) return null

    try {
      const result = await refetchUser()
      if (result?.data?.me) {
        user.value = result.data.me
        return result.data.me
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      logout()
    }
    return null
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  const setUser = (userData: User) => {
    user.value = userData
  }

  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access
    refreshToken.value = refresh

    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    hasRole,
    isAdmin,
    isOrganizer,
    login,
    register,
    fetchUser,
    logout,
    setUser,
    setTokens,
  }
})
