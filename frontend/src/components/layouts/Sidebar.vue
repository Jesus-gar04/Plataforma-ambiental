<template>
  <aside 
    class="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 pt-20 z-40 transition-transform duration-300"
    :class="{ '-translate-x-full': !isOpen }"
  >
    <div class="flex flex-col h-full">
      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 overflow-y-auto">
        <div v-for="(section, index) in menuSections" :key="index" class="mb-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            {{ section.title }}
          </p>
          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.path">
              <router-link
                :to="item.path"
                class="flex items-center px-3 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-600 transition-all duration-200 group"
                :class="{
                  'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg': isActive(item.path)
                }"
              >
                <span class="text-2xl mr-3 group-hover:scale-110 transition-transform">
                  {{ item.icon }}
                </span>
                <span class="font-medium">{{ item.label }}</span>
                <span 
                  v-if="item.badge" 
                  class="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                >
                  {{ item.badge }}
                </span>
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200">
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
          <p class="text-xs font-semibold text-gray-700 mb-1">
            ¿Necesitas ayuda?
          </p>
          <p class="text-xs text-gray-600 mb-3">
            Contacta a soporte técnico
          </p>
          <button class="w-full bg-white text-green-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            📧 Soporte
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Toggle Button -->
    <button
      @click="toggleSidebar"
      class="lg:hidden fixed top-24 -right-4 bg-white p-2 rounded-r-lg shadow-lg z-50"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute();
const store = useStore();
const isOpen = ref(true);

const user = computed(() => store.state.auth.user);

const menuSections = computed(() => {
  const role = user.value?.role;
  
  const menus = {
    student: [
      {
        title: 'Principal',
        items: [
          { path: '/dashboard', icon: '🏠', label: 'Inicio' },
          { path: '/courses', icon: '📚', label: 'Mis Cursos' },
          { path: '/certificates', icon: '🏆', label: 'Certificados' }
        ]
      },
      {
        title: 'Aprendizaje',
        items: [
          { path: '/progress', icon: '📊', label: 'Mi Progreso' },
          { path: '/evaluations', icon: '✅', label: 'Evaluaciones' }
        ]
      }
    ],
    teacher: [
      {
        title: 'Principal',
        items: [
          { path: '/professor/dashboard', icon: '🏠', label: 'Inicio' },
          { path: '/professor/monitoring', icon: '👥', label: 'Monitoreo', badge: '12' }
        ]
      },
      {
        title: 'Reportes',
        items: [
          { path: '/professor/reports', icon: '📊', label: 'Estadísticas' }
        ]
      }
    ],
    director: [
      {
        title: 'Principal',
        items: [
          { path: '/director/dashboard', icon: '🏠', label: 'Inicio' },
          { path: '/director/students', icon: '👥', label: 'Estudiantes' }
        ]
      },
      {
        title: 'Gestión',
        items: [
          { path: '/director/codes', icon: '🔑', label: 'Códigos de Acceso' },
          { path: '/director/reports', icon: '📊', label: 'Reportes' }
        ]
      }
    ],
    admin: [
      {
        title: 'Principal',
        items: [
          { path: '/admin/dashboard', icon: '🏠', label: 'Inicio' },
          { path: '/admin/institutions', icon: '🏫', label: 'Instituciones' },
          { path: '/admin/courses', icon: '📚', label: 'Gestión de Cursos' }
        ]
      },
      {
        title: 'Administración',
        items: [
          { path: '/admin/users', icon: '👥', label: 'Usuarios' },
          { path: '/admin/reports', icon: '📊', label: 'Reportes' }
        ]
      }
    ]
  };

  return menus[role] || menus.student;
});

const isActive = (path) => {
  return route.path === path;
};

const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
};
</script>