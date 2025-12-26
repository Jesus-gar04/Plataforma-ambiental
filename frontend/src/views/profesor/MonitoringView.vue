<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Monitoreo de Estudiantes</h1>
      <p class="text-gray-600">Seguimiento detallado del progreso</p>
    </div>

    <!-- Search -->
    <div class="card">
      <div class="flex gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar estudiante..."
            class="input-field pl-11 w-full"
          />
        </div>
        <select v-model="filterStatus" class="input-field">
          <option value="all">Todos</option>
          <option value="completado">Completados</option>
          <option value="en_progreso">En Progreso</option>
          <option value="no_iniciado">Sin Iniciar</option>
        </select>
      </div>
    </div>

    <!-- Students Progress Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200 bg-gray-50">
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Estudiante</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Progreso</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Módulos</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Evaluaciones</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Última Actividad</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold mr-3">
                    {{ student.initials }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ student.name }}</p>
                    <p class="text-sm text-gray-500">{{ student.code }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex flex-col items-center">
                  <div class="w-full max-w-[120px] mb-1">
                    <ProgressBar :percentage="student.progress" />
                  </div>
                  <span class="text-sm font-bold text-gray-700">{{ student.progress }}%</span>
                </div>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-sm font-semibold text-gray-700">
                  {{ student.completedModules }}/{{ student.totalModules }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="text-sm font-semibold" :class="student.avgScore >= 75 ? 'text-green-600' : 'text-red-600'">
                  {{ student.avgScore }}%
                </span>
              </td>
              <td class="py-3 px-4 text-center text-sm text-gray-600">
                {{ student.lastActivity }}
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center">
                  <button @click="viewDetails(student)" class="btn-primary text-sm px-3 py-1">
                    <Eye class="w-3 h-3 mr-1 inline" />
                    Ver
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Eye } from 'lucide-vue-next'
import ProgressBar from '@/components/common/ProgressBar.vue'

const searchQuery = ref('')
const filterStatus = ref('all')

const students = ref([
  {
    id: 1,
    name: 'Juan Pérez',
    code: 'EST001',
    initials: 'JP',
    progress: 85,
    completedModules: 3,
    totalModules: 4,
    avgScore: 88,
    lastActivity: 'Hace 2 horas',
    status: 'en_progreso'
  },
  {
    id: 2,
    name: 'María García',
    code: 'EST002',
    initials: 'MG',
    progress: 100,
    completedModules: 4,
    totalModules: 4,
    avgScore: 92,
    lastActivity: 'Hace 1 día',
    status: 'completado'
  },
  {
    id: 3,
    name: 'Pedro Ramírez',
    code: 'EST003',
    initials: 'PR',
    progress: 45,
    completedModules: 2,
    totalModules: 4,
    avgScore: 75,
    lastActivity: 'Hace 3 días',
    status: 'en_progreso'
  }
])

const filteredStudents = computed(() => {
  let filtered = students.value

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(s => s.status === filterStatus.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.code.toLowerCase().includes(query)
    )
  }

  return filtered
})

const viewDetails = (student) => {
  alert(`Ver detalles de ${student.name} - Implementar`)
}
</script>