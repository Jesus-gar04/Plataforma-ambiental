<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Dashboard - Profesor</h1>
      <p class="text-gray-600">Monitoreo de estudiantes y cursos</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Estudiantes"
        :value="stats.totalStudents"
        subtitle="Total en mis cursos"
        :icon="Users"
        iconBgClass="bg-blue-100"
        iconColorClass="text-blue-600"
      />
      <StatsCard
        title="Progreso Promedio"
        :value="stats.avgProgress + '%'"
        subtitle="De mis estudiantes"
        :icon="TrendingUp"
        iconBgClass="bg-green-100"
        iconColorClass="text-green-600"
      />
      <StatsCard
        title="Cursos Activos"
        :value="stats.activeCourses"
        subtitle="Disponibles"
        :icon="BookOpen"
        iconBgClass="bg-purple-100"
        iconColorClass="text-purple-600"
      />
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h3>
      <div class="space-y-3">
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div class="p-3 bg-primary-100 rounded-xl mr-4">
            <component :is="activity.icon" class="w-5 h-5 text-primary-600" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ activity.student }}</p>
            <p class="text-sm text-gray-600">{{ activity.action }}</p>
          </div>
          <span class="text-xs text-gray-500">{{ activity.time }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Action -->
    <button @click="$router.push('/profesor/monitoring')" 
            class="w-full card-hover group text-left bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Ver Monitoreo Completo</h3>
          <p class="text-gray-600">Revisa el progreso detallado de todos tus estudiantes</p>
        </div>
        <Eye class="w-12 h-12 text-purple-500 opacity-50 group-hover:scale-110 transition-transform" />
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Users, TrendingUp, BookOpen, Eye, CheckCircle, FileText } from 'lucide-vue-next'
import StatsCard from '@/components/common/StatsCard.vue'

const stats = ref({
  totalStudents: 45,
  avgProgress: 68,
  activeCourses: 1
})

const recentActivity = ref([
  {
    id: 1,
    icon: CheckCircle,
    student: 'Juan Pérez',
    action: 'Completó el Módulo 2',
    time: 'Hace 1 hora'
  },
  {
    id: 2,
    icon: FileText,
    student: 'María García',
    action: 'Aprobó evaluación con 85%',
    time: 'Hace 3 horas'
  },
  {
    id: 3,
    icon: CheckCircle,
    student: 'Pedro Ramírez',
    action: 'Inició el curso',
    time: 'Hace 1 día'
  }
])
</script>