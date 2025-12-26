import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role,
    userName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : ''
  },

  actions: {
    async login(credentials) {
      try {
        this.loading = true
        const { data } = await axios.post(`${API_URL}/auth/login`, credentials)
        
        this.token = data.data.token
        this.user = data.data.user
        
        localStorage.setItem('token', data.data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`
        
        return { success: true, user: data.data.user }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al iniciar sesión' 
        }
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      try {
        this.loading = true
        const { data } = await axios.post(`${API_URL}/auth/register`, userData)
        
        this.token = data.data.token
        this.user = data.data.user
        
        localStorage.setItem('token', data.data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`
        
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Error al registrarse' 
        }
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      if (!this.token) return

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        const { data } = await axios.get(`${API_URL}/auth/profile`)
        this.user = data.data
      } catch (error) {
        this.logout()
      }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  }
})