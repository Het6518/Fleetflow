import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,

      login: (userData, token) => {
        localStorage.setItem('fleetflow_token', token)
        localStorage.setItem('fleetflow_user', JSON.stringify(userData))
        set({ user: userData, token, role: userData.role })
      },

      logout: () => {
        localStorage.removeItem('fleetflow_token')
        localStorage.removeItem('fleetflow_user')
        set({ user: null, token: null, role: null })
      },
    }),
    {
      name: 'fleetflow-auth',
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role }),
    }
  )
)

export default useAuthStore
