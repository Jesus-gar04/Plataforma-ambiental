<template>
  <div class="min-h-screen flex">
    <!-- Left side - Image/Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-600 via-red-500 to-blue-900 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
        <img src="/logo.png" alt="Universidad Libre" class="w-48 h-48 object-contain mb-8" />
        <h1 class="text-5xl font-bold mb-4 text-center">Educación Ambiental</h1>
        <p class="text-xl text-center mb-2">Universidad Libre</p>
        <p class="text-lg text-center opacity-90">Seccional Barranquilla</p>
      </div>
    </div>

    <!-- Right side - Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div class="w-full max-w-md">
        <div class="text-center mb-8 lg:hidden">
          <img src="/logo.png" alt="Universidad Libre" class="w-24 h-24 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-gray-900">Educación Ambiental</h2>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido!</h2>
          <p class="text-gray-600 mb-8">Inicia sesión para continuar</p>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
            </button>
          </form>

          <p v-if="error" class="mt-4 text-center text-red-600 text-sm">{{ error }}</p>
        </div>

        <p class="mt-8 text-center text-sm text-gray-500">
          © 2025 Universidad Libre. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await authStore.login(form.value)
  loading.value = false

  if (result.success) {
    const routes = {
      root: '/admin',
      director: '/director',
      profesor: '/profesor',
      estudiante: '/student'
    }
    router.push(routes[result.user.role])
  } else {
    error.value = result.message || 'Error al iniciar sesión'
  }
}
</script>
