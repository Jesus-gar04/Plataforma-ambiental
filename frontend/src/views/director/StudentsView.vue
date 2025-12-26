<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Estudiantes</h1>
        <p class="text-gray-600">Administra los estudiantes de tu institución</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary shadow-lg">
        <UserPlus class="w-5 h-5 mr-2 inline" />
        Nuevo Estudiante
      </button>
    </div>

    <!-- Search -->
    <div class="card">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar estudiantes..."
          class="input-field pl-11 w-full"
        />
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Cargando estudiantes..." containerClass="" />

    <!-- Students Table -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200 bg-gray-50">
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Estudiante</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Código</th>
              <th class="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Cursos</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
              <th class="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold mr-3">
                    {{ getInitials(student.first_name, student.last_name) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ student.first_name }} {{ student.last_name }}</p>
                    <p class="text-sm text-gray-500">{{ student.document_type }}: {{ student.document_number }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  {{ student.code }}
                </span>
              </td>
              <td class="py-3 px-4 text-gray-700">{{ student.email }}</td>
              <td class="py-3 px-4 text-center">
                <span class="text-lg font-bold text-primary-600">{{ student.enrolled_courses || 0 }}</span>
              </td>
              <td class="py-3 px-4 text-center">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="student.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                >
                  {{ student.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="editStudent(student)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit class="w-4 h-4 text-gray-600" />
                  </button>
                  <button @click="viewProgress(student)" class="p-2 hover:bg-primary-50 rounded-lg transition-colors">
                    <Eye class="w-4 h-4 text-primary-600" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Student Modal -->
    <Modal v-model="showCreateModal" title="Nuevo Estudiante">
      <form @submit.prevent="saveStudent" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombres *</label>
            <input v-model="studentForm.firstName" type="text" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Apellidos *</label>
            <input v-model="studentForm.lastName" type="text" required class="input-field" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo Documento *</label>
            <select v-model="studentForm.documentType" required class="input-field">
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Número *</label>
            <input v-model="studentForm.documentNumber" type="text" required class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input v-model="studentForm.email" type="email" required class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input v-model="studentForm.phone" type="tel" class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
          <input v-model="studentForm.password" type="password" required class="input-field" />
        </div>

        <div class="flex space-x-4 pt-4">
          <button type="button" @click="showCreateModal = false" class="flex-1 btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="flex-1 btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/modules/auth'
import axios from 'axios'
import { UserPlus, Search, Edit, Eye } from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const authStore = useAuthStore()
const API_URL = import.meta.env.VITE_API_URL

const loading = ref(true)
const students = ref([])
const searchQuery = ref('')
const showCreateModal = ref(false)

const studentForm = ref({
  firstName: '',
  lastName: '',
  documentType: 'TI',
  documentNumber: '',
  email: '',
  phone: '',
  password: ''
})

const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value
  
  const query = searchQuery.value.toLowerCase()
  return students.value.filter(s =>
    s.first_name.toLowerCase().includes(query) ||
    s.last_name.toLowerCase().includes(query) ||
    s.code.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query)
  )
})

const getInitials = (firstName, lastName) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

const saveStudent = async () => {
  try {
    const institutionId = authStore.user?.institution_id
    await axios.post(`${API_URL}/institutions/${institutionId}/students`, studentForm.value)
    showCreateModal.value = false
    fetchStudents()
    alert('Estudiante creado exitosamente')
  } catch (error) {
    alert('Error: ' + error.response?.data?.message)
  }
}

const editStudent = (student) => {
  studentForm.value = { ...student }
  showCreateModal.value = true
}

const viewProgress = (student) => {
  alert(`Ver progreso de ${student.first_name} - Implementar`)
}

const fetchStudents = async () => {
  try {
    const institutionId = authStore.user?.institution_id
    const { data } = await axios.get(`${API_URL}/institutions/${institutionId}/students`)
    students.value = data.data
  } catch (error) {
    console.error('Error loading students:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStudents()
})
</script>