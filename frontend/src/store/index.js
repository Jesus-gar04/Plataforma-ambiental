import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    loading: false,
    notifications: []
  }),

  actions: {
    setLoading(status) {
      this.loading = status
    },

    addNotification(notification) {
      const id = Date.now()
      this.notifications.push({ id, ...notification })
      
      setTimeout(() => {
        this.removeNotification(id)
      }, 5000)
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})