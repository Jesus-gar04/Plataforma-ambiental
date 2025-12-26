<template>
  <div class="space-y-8 animate-fade-in">
    <LoadingSpinner v-if="loading" message="Cargando curso..." />

    <template v-else-if="course">
      <!-- Header -->
      <div class="card bg-gradient-to-r from-primary-50 to-green-50 border-l-4 border-primary-600">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <button @click="$router.back()" class="mr-4 p-2 hover:bg-white/50 rounded-lg transition-colors">
                <ArrowLeft class="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ course.title }}</h1>
                <p class="text-gray-600 mt-1">{{ course.description }}</p>
              </div>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-right mb-2">
              <span class="text-sm text-gray-600">Tu progreso</span>
              <p class="text-3xl font-bold text-primary-600">{{ Math.round(course.progress_percentage || 0) }}%</p>
            </div>
            <ProgressBar :percentage="course.progress_percentage || 0" />
          </div>
        </div>
      </div>

      <!-- Modules List -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Módulos del Curso</h2>
        <div class="space-y-4">
          <ModuleCard
            v-for="module in course.modules"
            :key="module.id"
            :module="module"
            :isCompleted="false"
            @click="openModule(module)"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/store/modules/course'
import { ArrowLeft } from 'lucide-vue-next'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import ModuleCard from '@/components/course/ModuleCard.vue'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const course = ref(null)

const openModule = (module) => {
  // Navigate to module content
  router.push(`/student/modules/${module.id}`)
}

onMounted(async () => {
  course.value = await courseStore.fetchCourseById(route.params.id)
  loading.value = false
})
</script>