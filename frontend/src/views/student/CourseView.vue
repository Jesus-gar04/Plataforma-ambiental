<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Mis Cursos</h1>
        <p class="text-gray-600">Explora y continúa tu aprendizaje</p>
      </div>
      
      <div class="flex items-center space-x-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar cursos..."
            class="input-field pl-11 w-64"
          />
        </div>
        
        <select v-model="filterStatus" class="input-field">
          <option value="all">Todos</option>
          <option value="en_progreso">En progreso</option>
          <option value="completado">Completados</option>
          <option value="no_iniciado">No iniciados</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex space-x-2 border-b border-gray-200">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-6 py-3 font-semibold transition-all"
        :class="activeTab === tab.value 
          ? 'text-primary-600 border-b-2 border-primary-600' 
          : 'text-gray-600 hover:text-gray-900'"
      >
        {{ tab.label }}
      </button>
    </div>

    <LoadingSpinner v-if="loading" message="Cargando cursos..." />

    <div v-else-if="filteredCourses.length === 0" class="text-center py-12">
      <BookOpen class="w-20 h-20 mx-auto text-gray-300 mb-4" />
      <h3 class="text-2xl font-bold text-gray-900 mb-2">No se encontraron cursos</h3>
      <p class="text-gray-600">Intenta con otros filtros o inscríbete en nuevos cursos</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        :progress="course.progress_percentage"
        :buttonText="getButtonText(course.status)"
        @click="handleCourseClick(course)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCourseStore } from '@/store/modules/course'
import { Search, BookOpen } from 'lucide-vue-next'
import CourseCard from '@/components/course/CourseCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref('all')
const activeTab = ref('enrolled')

const tabs = [
  { label: 'Inscritos', value: 'enrolled' },
  { label: 'Disponibles', value: 'available' }
]

const filteredCourses = computed(() => {
  let courses = activeTab.value === 'enrolled' 
    ? courseStore.myCourses 
    : courseStore.courses

  if (filterStatus.value !== 'all') {
    courses = courses.filter(c => c.status === filterStatus.value)
  }

  if (searchQuery.value) {
    courses = courses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return courses
})

const getButtonText = (status) => {
  const texts = {
    no_iniciado: 'Comenzar',
    en_progreso: 'Continuar',
    completado: 'Revisar',
    abandonado: 'Retomar'
  }
  return texts[status] || 'Ver curso'
}

const handleCourseClick = (course) => {
  if (activeTab.value === 'enrolled') {
    router.push(`/student/courses/${course.course_id || course.id}`)
  } else {
    // Inscribirse
    enrollCourse(course.id)
  }
}

const enrollCourse = async (courseId) => {
  const result = await courseStore.enrollCourse(courseId)
  if (result.success) {
    alert('¡Inscripción exitosa!')
    activeTab.value = 'enrolled'
  }
}

onMounted(async () => {
  await Promise.all([
    courseStore.fetchMyCourses(),
    courseStore.fetchCourses()
  ])
  loading.value = false
})
</script>