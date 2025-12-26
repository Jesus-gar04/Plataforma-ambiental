<template>
  <nav class="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
    <div class="px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo y Título -->
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform">
              <span class="text-2xl">🌱</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Universidad Libre</h1>
              <p class="text-xs text-gray-600">Educación Ambiental</p>
            </div>
          </div>
        </div>

        <!-- Search Bar (solo para admin/director) -->
        <div v-if="showSearch" class="hidden md:flex flex-1 max-w-lg mx-8">
          <div class="relative w-full">
            <input
              type="text"
              placeholder="Buscar cursos, estudiantes..."
              class="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              v-model="searchQuery"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <button 
            @click="toggleNotifications"
            class="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span class="text-2xl">🔔</span>
            <span 
              v-if="unreadNotifications > 0"
              class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {{ unreadNotifications }}
            </span>
          </button>

          <!-- User Dropdown -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="toggleUserMenu"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {{ userInitials }}
              </div>
              <div class="hidden md:block text-left">
                <p class="text-sm font-semibold text-gray-800">{{ user?.name }}</p>
                <p class="text-xs text-gray-600">{{ roleLabel }}</p>
              </div>
              <svg 
                class="w-5 h-5 text-gray-600 transition-transform"
                :class="{ 'rotate-180': showUserMenu }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <transition name="dropdown">
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-800">{{ user?.name }}</p>
                  <p class="text-xs text-gray-600">{{ user?.email }}</p>
                </div>

                <router-link
                  to="/profile"
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="showUserMenu = false"
                >
                  <span class="mr-3">👤</span>
                  <span class="text-sm">Mi Perfil</span>
                </router-link>

                <router-link
                  v-if="user?.role === 'student'"
                  to="/certificates"
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                  @click="showUserMenu = false"
                >
                  <span class="mr-3">🏆</span>
                  <span class="text-sm">Mis Certificados</span>
                </router-link>

                <button
                  class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <span class="mr-3">⚙️</span>
                  <span class="text-sm">Configuración</span>
                </button>

                <div class="border-t border-gray-100 mt-2 pt-2">
                  <button
                    @click="logout"
                    class="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <span class="mr-3">🚪</span>
                    <span class="text-sm font-semibold">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Panel -->
    <transition name="slide-down">
      <div
        v-if="showNotificationsPanel"
        class="absolute top-full right-0 mt-2 mr-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
      >
        <div class="p-4 border-b border-gray-100">
          <h3 class="font-bold text-gray-800">Notificaciones</h3>
        </div>
        <div v-if="notifications.length > 0">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <div class="flex items-start">
              <span class="text-2xl mr-3">{{ notification.icon }}</span>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{{ notification.title }}</p>
                <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ notification.time }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-8 text-center text-gray-500">
          <span class="text-4xl mb-2 block">📭</span>
          <p class="text-sm">No tienes notificaciones</p>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

const searchQuery = ref('');
const showUserMenu = ref(false);
const showNotificationsPanel = ref(false);
const userMenuRef = ref(null);

const user = computed(() => store.state.auth.user);
const unreadNotifications = ref(3);

const notifications = ref([
  {
    id: 1,
    icon: '✅',
    title: 'Módulo Completado',
    message: 'Has completado el Módulo 1 exitosamente',
    time: 'Hace 2 horas',
    read: false
  },
  {
    id: 2,
    icon: '📚',
    title: 'Nuevo Contenido',
    message: 'Se ha agregado nuevo material al curso',
    time: 'Hace 1 día',
    read: false
  },
  {
    id: 3,
    icon: '🏆',
    title: 'Certificado Disponible',
    message: 'Tu certificado está listo para descargar',
    time: 'Hace 2 días',
    read: true
  }
]);

const userInitials = computed(() => {
  if (!user.value?.name) return 'U';
  return user.value.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const roleLabel = computed(() => {
  const roles = {
    student: 'Estudiante',
    teacher: 'Profesor',
    director: 'Director',
    admin: 'Administrador'
  };
  return roles[user.value?.role] || 'Usuario';
});

const showSearch = computed(() => {
  return ['admin', 'director', 'teacher'].includes(user.value?.role);
});

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) {
    showNotificationsPanel.value = false;
  }
};

const toggleNotifications = () => {
  showNotificationsPanel.value = !showNotificationsPanel.value;
  if (showNotificationsPanel.value) {
    showUserMenu.value = false;
  }
};

const logout = async () => {
  await store.dispatch('auth/logout');
  router.push('/login');
};

// Close menus when clicking outside
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>