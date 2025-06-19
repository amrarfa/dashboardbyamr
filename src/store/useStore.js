import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiService from '../services/api'

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      user: null,

      // Theme state
      isDarkMode: false,

      // Dashboard data
      dashboardData: {
        totalUsers: 12345,
        revenue: 98765,
        activeUsers: 8901,
        conversionRate: 3.2,
        recentActivity: [
          { id: 1, user: 'John Doe', action: 'Logged in', time: '2 minutes ago' },
          { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '5 minutes ago' },
          { id: 3, user: 'Mike Johnson', action: 'Made purchase', time: '10 minutes ago' },
          { id: 4, user: 'Sarah Wilson', action: 'Logged out', time: '15 minutes ago' },
        ],
        chartData: [
          { name: 'Jan', users: 400, revenue: 2400 },
          { name: 'Feb', users: 300, revenue: 1398 },
          { name: 'Mar', users: 200, revenue: 9800 },
          { name: 'Apr', users: 278, revenue: 3908 },
          { name: 'May', users: 189, revenue: 4800 },
          { name: 'Jun', users: 239, revenue: 3800 },
        ]
      },

      // Actions
      login: async (email, password) => {
        try {
          const result = await apiService.login(email, password)

          if (result.success) {
            set({
              isAuthenticated: true,
              user: {
                id: result.user.id || 1,
                name: result.user.name || result.user.username || 'Admin User',
                email: email,
                avatar: result.user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
              }
            })
            return { success: true }
          } else {
            return { success: false, message: result.message || 'Login failed' }
          }
        } catch (error) {
          console.error('Login error:', error)
          return { success: false, message: 'Network error. Please try again.' }
        }
      },

      logout: () => {
        apiService.setToken(null)
        set({
          isAuthenticated: false,
          user: null
        })
      },

      toggleDarkMode: () => {
        const newMode = !get().isDarkMode
        set({ isDarkMode: newMode })

        // Update document class for Tailwind dark mode
        if (newMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      // Initialize dark mode from localStorage
      initializeDarkMode: () => {
        const isDark = get().isDarkMode
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      // Fetch dashboard data from API
      fetchDashboardData: async () => {
        try {
          const stats = await apiService.getDashboardStats()
          set({
            dashboardData: {
              ...get().dashboardData,
              totalUsers: stats.activeSubscriptions || get().dashboardData.totalUsers,
              revenue: stats.revenue || get().dashboardData.revenue,
              activeUsers: stats.totalPlans || get().dashboardData.activeUsers,
              recentActivity: stats.recentActivity || get().dashboardData.recentActivity
            }
          })
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error)
        }
      },

      // Fetch plans data
      fetchPlans: async () => {
        try {
          const plans = await apiService.getAllPlansHeader()
          return plans
        } catch (error) {
          console.error('Failed to fetch plans:', error)
          return []
        }
      },

      // Fetch items data
      fetchItems: async () => {
        try {
          const items = await apiService.getAllItems()
          return items
        } catch (error) {
          console.error('Failed to fetch items:', error)
          return []
        }
      },

      // Fetch customers data
      fetchCustomers: async () => {
        try {
          const customers = await apiService.getAllCustomers()
          return customers
        } catch (error) {
          console.error('Failed to fetch customers:', error)
          return []
        }
      },

      // Fetch customer categories
      fetchCustomerCategories: async () => {
        try {
          const categories = await apiService.getCustomersCategory()
          return categories
        } catch (error) {
          console.error('Failed to fetch customer categories:', error)
          return []
        }
      },

      // Fetch areas
      fetchAreas: async () => {
        try {
          const areas = await apiService.getAreas()
          return areas
        } catch (error) {
          console.error('Failed to fetch areas:', error)
          return []
        }
      }
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      })
    }
  )
)

export default useStore
