<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Gestión de Cursos</h1>
        <p class="text-gray-600">Crea y administra el contenido educativo</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary shadow-lg">
        <Plus class="w-5 h-5 mr-2 inline" />
        Nuevo Curso
      </button>
    </div>

    <LoadingSpinner v-if="loading" message="Cargando cursos..." containerClass="" />

    <!-- Courses List -->
    <div v-else class="space-y-6">
      <div
        v-for="course in courses"
        :key="course.id"
        class="card-hover border-l-4 border-primary-500"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center mb-3">
              <h3 class="text-2xl font-bold text-gray-900 mr-3">{{ course.title }}</h3>
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="course.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'"
              >
                {{ course.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            
            <p class="text-gray-600 mb-4">{{ course.description }}</p>

            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center text-gray-600">
                <Clock class="w-4 h-4 mr-1" />
                <span>{{ course.duration_hours }}h</span>
              </div>
              <div class="flex items-center text-gray-600">
                <BookOpen class="w-4 h-4 mr-1" />
                <span>{{ course.total_modules || 0 }} módulos</span>
              </div>
              <div class="flex items-center text-gray-600">
                <Users class="w-4 h-4 mr-1" />
                <span>{{ course.total_enrollments || 0 }} inscritos</span>
              </div>
              <div class="flex items-center text-gray-600">
                <Target class="w-4 h-4 mr-1" />
                <span>{{ course.passing_score }}% aprobación</span>
              </div>
            </div>
          </div>

          <div class="flex space-x-2 ml-4">
            <button @click="manageCourse(course)" class="btn-primary px-4 py-2">
              <Settings class="w-4 h-4 mr-1 inline" />
              Gestionar
            </button>
            <button @click="editCourse(course)" class="btn-secondary px-4 py-2">
              <Edit class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Modules Preview -->
        <div v-if="course.modules && course.modules.length > 0" class="mt-6 pt-6 border-t border-gray-100">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Módulos del curso:</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              v-for="module in course.modules"
              :key="module.id"
              class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center">
                <div class="p-2 bg-primary-100 rounded-lg mr-2">
                  <BookOpen class="w-4 h-4 text-primary-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ module.title }}</p>
                  <p class="text-xs text-gray-500">Módulo {{ module.order_index }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Course Modal -->
    <Modal v-model="showCreateModal" title="Crear Nuevo Curso">
      <form @submit.prevent="saveCourse" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Título del Curso *</label>
          <input v-model="courseForm.title" type="text" required class="input-field" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descripción Corta</label>
          <input v-model="courseForm.shortDescription" type="text" class="input-field" maxlength="500" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Descripción Completa</label>
          <textarea v-model="courseForm.description" rows="4" class="input-field"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
            <input v-model="courseForm.durationHours" type="number" class="input-field" min="1" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nota Mínima (%)</label>
            <input v-model="courseForm.passingScore" type="number" class="input-field" min="0" max="100" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio *</label>
            <input v-model="courseForm.startDate" type="date" required class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin *</label>
            <input v-model="courseForm.endDate" type="date" required class="input-field" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Máximo de Inscripciones</label>
          <input v-model="courseForm.maxEnrollments" type="number" class="input-field" min="1" />
        </div>

        <div class="flex space-x-4 pt-4">
          <button type="button" @click="showCreateModal = false" class="flex-1 btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="flex-1 btn-primary">
            Crear Curso
          </button>
        </div>
      </form>
    </Modal>

    <!-- Manage Course Modal (Modules & Content) -->
    <Modal v-model="showManageModal" :title="`Gestionar: ${selectedCourse?.title}`">
      <div v-if="selectedCourse" class="space-y-6">
        <!-- Add Module Section -->
        <div class="bg-gradient-to-br from-primary-50 to-green-50 p-4 rounded-xl">
          <h4 class="font-bold text-gray-900 mb-3">Agregar Módulo</h4>
          <form @submit.prevent="addModule" class="space-y-3">
            <input v-model="moduleForm.title" type="text" placeholder="Título del módulo" required class="input-field" />
            <textarea v-model="moduleForm.description" rows="2" placeholder="Descripción" class="input-field"></textarea>
            <div class="grid grid-cols-3 gap-2">
              <input v-model="moduleForm.orderIndex" type="number" placeholder="Orden" required class="input-field" />
              <input v-model="moduleForm.durationMinutes" type="number" placeholder="Duración (min)" class="input-field" />
              <input v-model="moduleForm.iconName" type="text" placeholder="Icono" class="input-field" />
            </div>
            <button type="submit" class="w-full btn-primary">
              <Plus class="w-4 h-4 mr-1 inline" />
              Agregar Módulo
            </button>
          </form>
        </div>

        <!-- Modules List -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3">Módulos del Curso</h4>
          <div class="space-y-2">
            <div
              v-for="module in selectedCourse.modules"
              :key="module.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div class="flex items-center flex-1">
                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm mr-3">
                  {{ module.order_index }}
                </span>
                <div>
                  <p class="font-medium text-gray-900">{{ module.title }}</p>
                  <p class="text-xs text-gray-500">{{ module.duration_minutes }} min</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button @click="manageContent(module)" class="btn-secondary text-sm px-3 py-1">
                  <FileText class="w-3 h-3 mr-1 inline" />
                  Contenido
                </button>
                <button @click="deleteModule(module.id)" class="btn-danger text-sm px-3 py-1">
                  <Trash class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Manage Content Modal -->
    <Modal v-model="showContentModal" :title="`Contenido: ${selectedModule?.title}`">
      <div v-if="selectedModule" class="space-y-6">
        <!-- Upload Content -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
          <h4 class="font-bold text-gray-900 mb-3">Agregar Contenido</h4>
          <form @submit.prevent="addContent" class="space-y-3">
            <input v-model="contentForm.title" type="text" placeholder="Título" required class="input-field" />
            
            <select v-model="contentForm.contentType" required class="input-field">
              <option value="">Tipo de contenido</option>
              <option value="video">Video</option>
              <option value="documento">Documento</option>
              <option value="imagen">Imagen</option>
              <option value="texto">Texto</option>
              <option value="enlace">Enlace</option>
            </select>

            <textarea
              v-if="contentForm.contentType === 'texto'"
              v-model="contentForm.contentText"
              rows="6"
              placeholder="Contenido HTML"
              class="input-field"
            ></textarea>

            <FileUpload
              v-if="['video', 'documento', 'imagen'].includes(contentForm.contentType)"
              :accept="getAcceptedFormats(contentForm.contentType)"
              :acceptText="getAcceptedText(contentForm.contentType)"
              @files-selected="handleFilesSelected"
            />

            <input v-model="contentForm.orderIndex" type="number" placeholder="Orden" required class="input-field" />
            
            <button type="submit" :disabled="uploadingContent" class="w-full btn-primary">
              <Upload class="w-4 h-4 mr-1 inline" />
              {{ uploadingContent ? 'Subiendo...' : 'Agregar Contenido' }}
            </button>
          </form>
        </div>

        <!-- Content List -->
        <div>
          <h4 class="font-bold text-gray-900 mb-3">Contenidos del Módulo</h4>
          <div class="space-y-2">
            <div
              v-for="content in moduleContents"
              :key="content.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center flex-1">
                <component :is="getContentIcon(content.content_type)" class="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p class="font-medium text-gray-900">{{ content.title }}</p>
                  <p class="text-xs text-gray-500 capitalize">{{ content.content_type }}</p>
                </div>
              </div>
              <button @click="deleteContent(content.id)" class="btn-danger text-sm px-3 py-1">
                <Trash class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import {
  Plus, Clock, BookOpen, Users, Target, Settings, Edit, FileText, Trash,
  Upload, Video, FileIcon, Image as ImageIcon, Link, Type
} from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import FileUpload from '@/components/course/FileUpload.vue'

const API_URL = import.meta.env.VITE_API_URL

const loading = ref(true)
const courses = ref([])
const showCreateModal = ref(false)
const showManageModal = ref(false)
const showContentModal = ref(false)
const selectedCourse = ref(null)
const selectedModule = ref(null)
const moduleContents = ref([])
const uploadingContent = ref(false)
const selectedFiles = ref([])

const courseForm = ref({
  title: '',
  description: '',
  shortDescription: '',
  durationHours: 20,
  passingScore: 75,
  startDate: '2025-01-15',
  endDate: '2025-12-31',
  maxEnrollments: null
})

const moduleForm = ref({
  title: '',
  description: '',
  orderIndex: 1,
  durationMinutes: 60,
  iconName: 'leaf'
})

const contentForm = ref({
  title: '',
  contentType: '',
  contentText: '',
  orderIndex: 1
})

const saveCourse = async () => {
  try {
    await axios.post(`${API_URL}/courses`, courseForm.value)
    showCreateModal.value = false
    fetchCourses()
    alert('Curso creado exitosamente')
  } catch (error) {
    alert('Error: ' + error.response?.data?.message)
  }
}

const manageCourse = async (course) => {
  selectedCourse.value = course
  if (!course.modules) {
    const { data } = await axios.get(`${API_URL}/courses/${course.id}`)
    selectedCourse.value = data.data
  }
  showManageModal.value = true
}

const addModule = async () => {
  try {
    await axios.post(`${API_URL}/courses/${selectedCourse.value.id}/modules`, moduleForm.value)
    manageCourse(selectedCourse.value)
    moduleForm.value = { title: '', description: '', orderIndex: 1, durationMinutes: 60, iconName: 'leaf' }
    alert('Módulo agregado')
  } catch (error) {
    alert('Error: ' + error.response?.data?.message)
  }
}

const manageContent = async (module) => {
  selectedModule.value = module
  const { data } = await axios.get(`${API_URL}/courses/modules/${module.id}/contents`)
  moduleContents.value = data.data
  showContentModal.value = true
}

const handleFilesSelected = (files) => {
  selectedFiles.value = files
}

const addContent = async () => {
  try {
    uploadingContent.value = true
    const formData = new FormData()
    formData.append('title', contentForm.value.title)
    formData.append('contentType', contentForm.value.contentType)
    formData.append('orderIndex', contentForm.value.orderIndex)
    
    if (contentForm.value.contentText) {
      formData.append('contentText', contentForm.value.contentText)
    }
    
    if (selectedFiles.value.length > 0) {
      formData.append('file', selectedFiles.value[0])
    }

    await axios.post(`${API_URL}/courses/modules/${selectedModule.value.id}/contents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    manageContent(selectedModule.value)
    contentForm.value = { title: '', contentType: '', contentText: '', orderIndex: 1 }
    selectedFiles.value = []
    alert('Contenido agregado')
  } catch (error) {
    alert('Error: ' + error.response?.data?.message)
  } finally {
    uploadingContent.value = false
  }
}

const deleteModule = async (moduleId) => {
  if (!confirm('¿Eliminar este módulo?')) return
  try {
    await axios.delete(`${API_URL}/courses/modules/${moduleId}`)
    manageCourse(selectedCourse.value)
  } catch (error) {
    alert('Error al eliminar')
  }
}

const deleteContent = async (contentId) => {
  if (!confirm('¿Eliminar este contenido?')) return
  try {
    await axios.delete(`${API_URL}/courses/contents/${contentId}`)
    manageContent(selectedModule.value)
  } catch (error) {
    alert('Error al eliminar')
  }
}

const getAcceptedFormats = (type) => {
  const formats = {
    video: '.mp4,.webm,.ogg',
    documento: '.pdf,.doc,.docx,.ppt,.pptx',
    imagen: '.jpg,.jpeg,.png,.gif,.webp'
  }
  return formats[type] || '*'
}

const getAcceptedText = (type) => {
  const texts = {
    video: 'Videos (MP4, WebM, OGG)',
    documento: 'Documentos (PDF, Word, PowerPoint)',
    imagen: 'Imágenes (JPG, PNG, GIF, WebP)'
  }
  return texts[type] || 'Todos los archivos'
}

const getContentIcon = (type) => {
  const icons = {
    video: Video,
    documento: FileIcon,
    imagen: ImageIcon,
    enlace: Link,
    texto: Type
  }
  return icons[type] || FileIcon
}

const editCourse = (course) => {
  courseForm.value = { ...course }
  showCreateModal.value = true
}

const fetchCourses = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/courses`)
    courses.value = data.data
  } catch (error) {
    console.error('Error loading courses:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})
</script>