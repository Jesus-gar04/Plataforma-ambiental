<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Dashboard Administrativo</h1>
      <p class="text-gray-600">Resumen general de la plataforma</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Instituciones"
        :value="stats.totalInstitutions"
        subtitle="Registradas"
        :icon="School"
        iconBgClass="bg-blue-100"
        iconColorClass="text-blue-600"
      />
      <StatsCard
        title="Estudiantes"
        :value="stats.totalStudents"
        subtitle="Activos"
        :icon="Users"
        iconBgClass="bg-green-100"
        iconColorClass="text-green-600"
      />
      <StatsCard
        title="Cursos"
        :value="stats.totalCourses"
        subtitle="Disponibles"
        :icon="BookOpen"
        iconBgClass="bg-purple-100"
        iconColorClass="text-purple-600"
      />
      <StatsCard
        title="Certificados"
        :value="stats.totalCertificates"
        subtitle="Emitidos"
        :icon="Award"
        iconBgClass="bg-yellow-100"
        iconColorClass="text-yellow-600"
      />
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Enrollment Chart -->
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Inscripciones por Mes</h3>
        <div class="h-64 flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-50 rounded-xl">
          <TrendingUp class="w-20 h-20 text-primary-400" />
        </div>
      </div>

      <!-- Course Status -->
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Estado de Cursos</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Completados</span>
              <span class="text-sm font-bold text-green-600">45%</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-green-600" style="width: 45%"></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">En progreso</span>
              <span class="text-sm font-bold text-blue-600">35%</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600" style="width: 35%"></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">No iniciados</span>
              <span class="text-sm font-bold text-gray-600">20%</span>
            </div>
            <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-gray-400 to-gray-500" style="width: 20%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
      <div class="space-y-4">
        <div v-for="activity in recentActivity" :key="activity.id" 
             class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div :class="activity.iconBg" class="p-3 rounded-xl mr-4">
            <component :is="activity.icon" :class="activity.iconColor" class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ activity.title }}</p>
            <p class="text-sm text-gray-600">{{ activity.description }}</p>
          </div>
          <span class="text-xs text-gray-500">{{ activity.time }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button @click="$router.push('/admin/institutions')" 
              class="card-hover group text-left bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
            <Plus class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Nueva Institución</h3>
        <p class="text-sm text-gray-600">Registrar un nuevo colegio</p>
      </button>

      <button @click="$router.push('/admin/courses')" 
              class="card-hover group text-left bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
            <Plus class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Nuevo Curso</h3>
        <p class="text-sm text-gray-600">Crear contenido educativo</p>
      </button>

      <button @click="$router.push('/admin/reports')" 
              class="card-hover group text-left bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
            <FileText class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Ver Reportes</h3>
        <p class="text-sm text-gray-600">Análisis y estadísticas</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { School, Users, BookOpen, Award, TrendingUp, Plus, FileText, UserPlus, Upload, CheckCircle } from 'lucide-vue-next'
import StatsCard from '@/components/common/StatsCard.vue'

const API_URL = import.meta.env.VITE_API_URL

const stats = ref({
  totalInstitutions: 0,
  totalStudents: 0,
  totalCourses: 0,
  totalCertificates: 0
})

const recentActivity = ref([
  {
    id: 1,
    icon: UserPlus,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Nueva institución registrada',
    description: 'Colegio Santa María se ha unido a la plataforma',
    time: 'Hace 2 horas'
  },
  {
    id: 2,
    icon: Upload,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Contenido actualizado',
    description: 'Módulo de Ecosistemas ha sido actualizado',
    time: 'Hace 5 horas'
  },
  {
    id: 3,
    icon: CheckCircle,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Certificados emitidos',
    description: '15 estudiantes completaron el curso',
    time: 'Hace 1 día'
  }
])

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_URL}/reports/stats`)
    stats.value = data.data
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})
</script>