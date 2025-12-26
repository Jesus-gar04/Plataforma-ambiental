<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Dashboard - {{ institutionName }}</h1>
      <p class="text-gray-600">Resumen de tu institución educativa</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Estudiantes"
        :value="stats.totalStudents"
        subtitle="Registrados"
        :icon="Users"
        iconBgClass="bg-blue-100"
        iconColorClass="text-blue-600"
      />
      <StatsCard
        title="Activos"
        :value="stats.activeStudents"
        subtitle="Cursando"
        :icon="TrendingUp"
        iconBgClass="bg-green-100"
        iconColorClass="text-green-600"
      />
      <StatsCard
        title="Completados"
        :value="stats.completedStudents"
        subtitle="Finalizaron"
        :icon="CheckCircle"
        iconBgClass="bg-purple-100"
        iconColorClass="text-purple-600"
      />
      <StatsCard
        title="Progreso Promedio"
        :value="stats.avgProgress + '%'"
        subtitle="General"
        :icon="Target"
        iconBgClass="bg-orange-100"
        iconColorClass="text-orange-600"
      />
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Progreso General</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Completados</span>
              <span class="text-sm font-bold text-green-600">{{ stats.completionRate }}%</span>
            </div>
            <ProgressBar :percentage="stats.completionRate" />
          </div>
          
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">En Progreso</span>
              <span class="text-sm font-bold text-blue-600">{{ stats.inProgressRate }}%</span>
            </div>
            <ProgressBar :percentage="stats.inProgressRate" />
          </div>
          
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Sin Iniciar</span>
              <span class="text-sm font-bold text-gray-600">{{ stats.notStartedRate }}%</span>
            </div>
            <ProgressBar :percentage="stats.notStartedRate" />
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="text-xl font-bold text-gray-900 mb-4">Top Estudiantes</h3>
        <div class="space-y-3">
          <div
            v-for="(student, index) in topStudents"
            :key="student.id"
            class="flex items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold mr-3">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900">{{ student.name }}</p>
              <p class="text-xs text-gray-500">{{ student.code }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-primary-600">{{ student.progress }}%</p>
              <p class="text-xs text-gray-500">Progreso</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button @click="$router.push('/director/students')" 
              class="card-hover group text-left bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-400">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
            <UserPlus class="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Agregar Estudiante</h3>
        <p class="text-sm text-gray-600">Registrar nuevo estudiante</p>
      </button>

      <button @click="viewReports" 
              class="card-hover group text-left bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:border-green-400">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform">
            <BarChart3 class="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Ver Reportes</h3>
        <p class="text-sm text-gray-600">Estadísticas detalladas</p>
      </button>

      <button @click="downloadReport" 
              class="card-hover group text-left bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
            <Download class="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Descargar Reporte</h3>
        <p class="text-sm text-gray-600">Exportar datos</p>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import axios from 'axios'
import { Users, TrendingUp, CheckCircle, Target, UserPlus, BarChart3, Download } from 'lucide-vue-next'
import StatsCard from '@/components/common/StatsCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL

const institutionName = computed(() => authStore.user?.institution_name || 'Mi Institución')

const stats = ref({
  totalStudents: 0,
  activeStudents: 0,
  completedStudents: 0,
  avgProgress: 0,
  completionRate: 0,
  inProgressRate: 0,
  notStartedRate: 0
})

const topStudents = ref([
  { id: 1, name: 'Juan Pérez', code: 'EST001', progress: 95 },
  { id: 2, name: 'María García', code: 'EST002', progress: 88 },
  { id: 3, name: 'Pedro Ramírez', code: 'EST003', progress: 82 }
])

const viewReports = () => {
  alert('Vista de reportes - Implementar')
}

const downloadReport = () => {
  alert('Descargar reporte - Implementar')
}

onMounted(async () => {
  try {
    const institutionId = authStore.user?.institution_id
    if (institutionId) {
      const { data } = await axios.get(`${API_URL}/reports/institutions/${institutionId}/report`)
      // Process data
      stats.value = {
        totalStudents: data.data.length,
        activeStudents: data.data.filter(s => s.enrolled_courses > 0).length,
        completedStudents: data.data.filter(s => s.completed_courses > 0).length,
        avgProgress: Math.round(data.data.reduce((sum, s) => sum + (s.avg_progress || 0), 0) / data.data.length),
        completionRate: 45,
        inProgressRate: 35,
        notStartedRate: 20
      }
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})
</script>