<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Navbar -->
    <nav class="bg-white shadow-lg sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center">
            <img src="/logo.png" alt="Universidad Libre" class="h-14 w-14 object-contain" />
            <div class="ml-4">
              <h1 class="text-xl font-bold bg-gradient-to-r from-unilibre-red to-red-600 bg-clip-text text-transparent">
                Educación Ambiental
              </h1>
              <p class="text-xs text-gray-600">Universidad Libre - Barranquilla</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200"
              :class="$route.path === item.path 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
            >
              <component :is="item.icon" class="w-5 h-5 mr-2" />
              {{ item.label }}
            </router-link>

            <div class="relative" ref="dropdownRef">
              <button
                @click="showDropdown = !showDropdown"
                class="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                  {{ userInitials }}
                </div>
                <div class="text-left hidden md:block">
                  <p class="text-sm font-semibold text-gray-900">{{ userName }}</p>
                  <p class="text-xs text-gray-500">Estudiante</p>
                </div>
                <ChevronDown class="w-4 h-4 text-gray-600" />
              </button>

              <Transition name="dropdown">
                <div v-if="showDropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                  <router-link to="/student/profile" class="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <User class="w-5 h-5 mr-3 text-gray-600" />
                    <span class="text-sm font-medium text-gray-700">Mi Perfil</span>
                  </router-link>
                  <router-link to="/student/certificates" class="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                    <Award class="w-5 h-5 mr-3 text-gray-600" />
                    <span class="text-sm font-medium text-gray-700">Certificados</span>
                  </router-link>
                  <hr class="my-2" />
                  <button @click="logout" class="w-full flex items-center px-4 py-3 hover:bg-red-50 transition-colors text-red-600">
                    <LogOut class="w-5 h-5 mr-3" />
                    <span class="text-sm font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center mb-4 md:mb-0">
            <img src="/logo.png" alt="Universidad Libre" class="h-12 w-12 object-contain" />
            <div class="ml-3">
              <p class="text-sm font-semibold text-gray-900">Universidad Libre</p>
              <p class="text-xs text-gray-600">Seccional Barranquilla</p>
            </div>
          </div>
          <p class="text-sm text-gray-600">© 2025 Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { Home, BookOpen, Award, User, LogOut, ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref(null)

const navItems = [
  { path: '/student', label: 'Inicio', icon: Home },
  { path: '/student/courses', label: 'Mis Cursos', icon: BookOpen },
  { path: '/student/certificates', label: 'Certificados', icon: Award }
]

const userName = computed(() => authStore.userName)
const userInitials = computed(() => {
  const names = authStore.userName.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>