<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Reportes y Estadísticas</h1>
      <p class="text-gray-600">Análisis detallado de la plataforma</p>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="flex flex-wrap gap-4">
        <select v-model="selectedCourse" class="input-field">
          <option value="">Todos los cursos</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
        </select>

        <select v-model="selectedInstitution" class="input-field">
          <option value="">Todas las instituciones</option>
          <option v-for="inst in institutions" :key="inst.id" :value="inst.id">
            {{ inst.name }}
          </option>
        </select>

        <select v-model="dateRange" class="input-field">
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
          <option value="year">Último año</option>
          <option value="all">Todo el tiempo</option>
        </select>

        <button @click="generateReport" class="btn-primary">
          <BarChart3 class="w-4 h-4 mr-2 inline" />
          Generar Reporte
        </button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Generando reporte..." containerClass="" />

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-700 font-medium mb-1">Tasa de Completitud</p>
              <p class="text-3xl font-bold text-blue-900">{{ reportData.completionRate }}%</p>
            </div>
            <TrendingUp class="w-12 h-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-700 font-medium mb-1">Tasa de Aprobación</p>
              <p class="text-3xl font-bold text-green-900">{{ reportData.passRate }}%</p>
            </div>
            <CheckCircle class="w-12 h-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-purple-700 font-medium mb-1">Tiempo Promedio</p>
              <p class="text-3xl font-bold text-purple-900">{{ reportData.avgTime }}h</p>
            </div>
            <Clock class="w-12 h-12 text-purple-500 opacity-50" />
          </div>
        </div>

        <div class="card bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-red-700 font-medium mb-1">Tasa de Abandono</p>
              <p class="text-3xl font-bold text-red-900">{{ reportData.dropoutRate }}%</p>
            </div>
            <AlertCircle class="w-12 h-12 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Progreso por Institución</h3>
          <div class="space-y-3">
            <div v-for="inst in reportData.byInstitution" :key="inst.name">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">{{ inst.name }}</span>
                <span class="text-sm font-bold text-primary-600">{{ inst.progress }}%</span>
              </div>
              <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                  :style="{ width: inst.progress + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Estado de Estudiantes</h3>
          <div class="h-64 flex items-center justify-center">
            <div class="text-center">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <div class="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <span class="text-2xl font-bold text-green-600">{{ reportData.completed }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-700">Completados</p>
                </div>
                <div>
                  <div class="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span class="text-2xl font-bold text-blue-600">{{ reportData.inProgress }}</span>
                  </div>
                  <p class="text-sm font-medium text-gray-700">En Progreso</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900">Detalle por Estudiante</h3>
          <button @click="exportToExcel" class="btn-secondary">
            <Download class="w-4 h-4 mr-2 inline" />
            Exportar Excel
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Estudiante</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Institución</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Curso</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Progreso</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                <th class="text-center py-3 px-4 font-semibold text-gray-700">Certificado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in reportData.students"
                :key="student.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium text-gray-900">{{ student.name }}</p>
                    <p class="text-sm text-gray-500">{{ student.email }}</p>
                  </div>
                </td>
                <td class="py-3 px-4 text-gray-700">{{ student.institution }}</td>
                <td class="py-3 px-4 text-gray-700">{{ student.course }}</td>
                <td class="py-3 px-4">
                  <div class="flex items-center justify-center">
                    <div class="w-24">
                      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                          :style="{ width: student.progress + '%' }"
                        ></div>
                      </div>
                    </div>
                    <span class="ml-2 text-sm font-semibold text-gray-700">{{ student.progress }}%</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold"
                    :class="getStatusClass(student.status)"
                  >
                    {{ getStatusText(student.status) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center">
                  <component
                    :is="student.hasCertificate ? CheckCircle : XCircle"
                    :class="student.hasCertificate ? 'text-green-600' : 'text-gray-300'"
                    class="w-5 h-5 mx-auto"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle, Download, XCircle
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const API_URL = import.meta.env.VITE_API_URL

const loading = ref(true)
const courses = ref([])
const institutions = ref([])
const selectedCourse = ref('')
const selectedInstitution = ref('')
const dateRange = ref('month')

const reportData = ref({
  completionRate: 0,
  passRate: 0,
  avgTime: 0,
  dropoutRate: 0,
  byInstitution: [],
  completed: 0,
  inProgress: 0,
  students: []
})

const generateReport = async () => {
  loading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/reports/stats`)
    
    // Mock data - replace with real API calls
    reportData.value = {
      completionRate: 68,
      passRate: 85,
      avgTime: 18,
      dropoutRate: 12,
      byInstitution: [
        { name: 'Colegio Santa María', progress: 75 },
        { name: 'Instituto Técnico', progress: 65 },
        { name: 'Colegio Los Ángeles', progress: 82 }
      ],
      completed: 45,
      inProgress: 28,
      students: [
        {
          id: 1,
          name: 'Juan Pérez',
          email: 'juan@test.com',
          institution: 'Colegio Santa María',
          course: 'Educación Ambiental',
          progress: 100,
          status: 'completado',
          hasCertificate: true
        },
        {
          id: 2,
          name: 'María García',
          email: 'maria@test.com',
          institution: 'Colegio Santa María',
          course: 'Educación Ambiental',
          progress: 65,
          status: 'en_progreso',
          hasCertificate: false
        }
      ]
    }
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  const classes = {
    completado: 'bg-green-100 text-green-700',
    en_progreso: 'bg-blue-100 text-blue-700',
    abandonado: 'bg-red-100 text-red-700',
    no_iniciado: 'bg-gray-100 text-gray-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getStatusText = (status) => {
  const texts = {
    completado: 'Completado',
    en_progreso: 'En Progreso',
    abandonado: 'Abandonado',
    no_iniciado: 'No Iniciado'
  }
  return texts[status] || status
}

const exportToExcel = () => {
  alert('Función de exportar a Excel - Implementar según necesidad')
}

onMounted(async () => {
  try {
    const [coursesData, institutionsData] = await Promise.all([
      axios.get(`${API_URL}/courses`),
      axios.get(`${API_URL}/institutions`)
    ])
    courses.value = coursesData.data.data
    institutions.value = institutionsData.data.data
    
    await generateReport()
  } catch (error) {
    console.error('Error loading data:', error)
    loading.value = false
  }
})
</script>