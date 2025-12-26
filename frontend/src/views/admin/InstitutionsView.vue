<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Instituciones</h1>
        <p class="text-gray-600">Administra los colegios registrados en la plataforma</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary shadow-lg">
        <Plus class="w-5 h-5 mr-2 inline" />
        Nueva Institución
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[300px] relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar instituciones..."
            class="input-field pl-11 w-full"
          />
        </div>
        <select v-model="filterStatus" class="input-field">
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
      </div>
    </div>

    <LoadingSpinner v-if="loading" message="Cargando instituciones..." containerClass="" />

    <!-- Institutions Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="institution in filteredInstitutions"
        :key="institution.id"
        class="card-hover group cursor-pointer border-l-4"
        :class="institution.is_active ? 'border-primary-500' : 'border-gray-300'"
        @click="selectInstitution(institution)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="p-3 bg-primary-100 rounded-xl group-hover:scale-110 transition-transform">
            <School class="w-6 h-6 text-primary-600" />
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="institution.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
          >
            {{ institution.is_active ? 'Activa' : 'Inactiva' }}
          </span>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {{ institution.name }}
        </h3>
        
        <div class="space-y-2 text-sm text-gray-600">
          <div class="flex items-center">
            <Hash class="w-4 h-4 mr-2" />
            <span class="font-medium">{{ institution.code }}</span>
          </div>
          <div class="flex items-center">
            <MapPin class="w-4 h-4 mr-2" />
            <span>{{ institution.city }}</span>
          </div>
          <div class="flex items-center">
            <Users class="w-4 h-4 mr-2" />
            <span>{{ institution.total_users || 0 }} usuarios</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
          <button @click.stop="editInstitution(institution)" class="flex-1 btn-secondary text-sm py-2">
            <Edit class="w-4 h-4 mr-1 inline" />
            Editar
          </button>
          <button @click.stop="viewStudents(institution)" class="flex-1 btn-primary text-sm py-2">
            <Users class="w-4 h-4 mr-1 inline" />
            Estudiantes
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal v-model="showCreateModal" title="Nueva Institución">
      <form @submit.prevent="saveInstitution" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Código *</label>
          <input v-model="institutionForm.code" type="text" required class="input-field" placeholder="INST001" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
          <input v-model="institutionForm.name" type="text" required class="input-field" placeholder="Colegio..." />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
            <input v-model="institutionForm.city" type="text" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
            <input v-model="institutionForm.department" type="text" required class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input v-model="institutionForm.address" type="text" class="input-field" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input v-model="institutionForm.phone" type="tel" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input v-model="institutionForm.email" type="email" class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Persona de contacto</label>
          <input v-model="institutionForm.contactPerson" type="text" class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Máximo de estudiantes</label>
          <input v-model="institutionForm.maxStudents" type="number" class="input-field" />
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
import { useRouter } from 'vue-router'
import axios from 'axios'
import { School, Plus, Search, Hash, MapPin, Users, Edit } from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const loading = ref(true)
const institutions = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const showCreateModal = ref(false)

const institutionForm = ref({
  code: '',
  name: '',
  city: '',
  department: '',
  address: '',
  phone: '',
  email: '',
  contactPerson: '',
  maxStudents: 100
})

const filteredInstitutions = computed(() => {
  let filtered = institutions.value

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(i => 
      filterStatus.value === 'active' ? i.is_active : !i.is_active
    )
  }

  if (searchQuery.value) {
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const saveInstitution = async () => {
  try {
    await axios.post(`${API_URL}/institutions`, institutionForm.value)
    showCreateModal.value = false
    fetchInstitutions()
    alert('Institución creada exitosamente')
  } catch (error) {
    alert('Error al crear institución: ' + error.response?.data?.message)
  }
}

const selectInstitution = (institution) => {
  console.log('Selected:', institution)
}

const editInstitution = (institution) => {
  institutionForm.value = { ...institution }
  showCreateModal.value = true
}

const viewStudents = (institution) => {
  router.push(`/admin/institutions/${institution.id}/students`)
}

const fetchInstitutions = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/institutions`)
    institutions.value = data.data
  } catch (error) {
    console.error('Error loading institutions:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInstitutions()
})
</script>