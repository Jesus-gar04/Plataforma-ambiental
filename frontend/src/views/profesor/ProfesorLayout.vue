<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-xl fixed h-screen overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center">
            <img src="/logo.png" alt="Universidad Libre" class="h-12 w-12 object-contain" />
            <div class="ml-3">
              <h2 class="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Panel Profesor
              </h2>
              <p class="text-xs text-gray-600">{{ institutionName }}</p>
            </div>
          </div>
        </div>

        <nav class="p-4">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-4 py-3 mb-2 rounded-xl font-medium transition-all duration-200 group"
            :class="$route.path === item.path 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'text-gray-600 hover:bg-gray-100'"
          >
            <component :is="item.icon" class="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
            {{ item.label }}
          </router-link>
        </nav>

        <div class="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div class="flex items-center mb-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
              {{ userInitials }}
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">{{ userName }}</p>
              <p class="text-xs text-gray-500">Profesor</p>
            </div>
          </div>
          <button @click="logout" class="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium">
            <LogOut class="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 ml-64 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { LayoutDashboard, Eye, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  { path: '/profesor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/profesor/monitoring', label: 'Monitoreo', icon: Eye }
]

const userName = computed(() => authStore.userName)
const institutionName = computed(() => authStore.user?.institution_name || 'Mi Institución')
const userInitials = computed(() => {
  const names = authStore.userName.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>