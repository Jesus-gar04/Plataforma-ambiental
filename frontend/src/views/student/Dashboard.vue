<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Hero Section -->
    <div class="relative bg-gradient-to-r from-unilibre-red via-red-600 to-unilibre-blue rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="absolute right-0 top-0 opacity-10">
        <Leaf class="w-64 h-64" />
      </div>
      
      <div class="relative z-10 text-white">
        <h1 class="text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
          ¡Hola, {{ firstName }}! 👋
        </h1>
        <p class="text-xl opacity-90 mb-6 animate-slide-up" style="animation-delay: 0.1s">
          Continúa tu aprendizaje sobre educación ambiental
        </p>
        <div class="flex flex-wrap gap-4 animate-slide-up" style="animation-delay: 0.2s">
          <router-link to="/student/courses" class="px-6 py-3 bg-white text-unilibre-red font-semibold rounded-xl hover:bg-gray-100 transform hover:-translate-y-1 transition-all shadow-lg">
            Explorar Cursos
          </router-link>
          <button class="px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all">
            Mi Progreso
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Cursos Activos"
        :value="stats.activeCourses"
        subtitle="En progreso"
        :icon="BookOpen"
        iconBgClass="bg-blue-100"
        iconColorClass="text-blue-600"
      />
      <StatsCard
        title="Progreso Total"
        :value="stats.totalProgress + '%'"
        subtitle="Completado"
        :icon="TrendingUp"
        iconBgClass="bg-green-100"
        iconColorClass="text-green-600"
      />
      <StatsCard
        title="Evaluaciones"
        :value="stats.evaluations"
        subtitle="Aprobadas"
        :icon="CheckCircle"
        iconBgClass="bg-purple-100"
        iconColorClass="text-purple-600"
      />
      <StatsCard
        title="Certificados"
        :value="stats.certificates"
        subtitle="Obtenidos"
        :icon="Award"
        iconBgClass="bg-yellow-100"
        iconColorClass="text-yellow-600"
      />
    </div>

    <!-- Active Courses -->
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Mis Cursos Activos</h2>
        <router-link to="/student/courses" class="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
          Ver todos
          <ArrowRight class="w-5 h-5 ml-1" />
        </router-link>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner message="Cargando cursos..." containerClass="" />
      </div>

      <div v-else-if="activeCourses.length === 0" class="text-center py-12">
        <BookOpen class="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No tienes cursos activos</h3>
        <p class="text-gray-600 mb-6">Inscríbete en un curso para comenzar tu aprendizaje</p>
        <router-link to="/student/courses" class="btn-primary inline-flex items-center">
          Explorar Cursos
          <ArrowRight class="w-5 h-5 ml-2" />
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseCard
          v-for="course in activeCourses"
          :key="course.id"
          :course="course"
          :progress="course.progress_percentage"
          buttonText="Continuar"
          @click="router.push(`/student/courses/${course.course_id}`)"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card-hover group cursor-pointer bg-gradient-to-br from-primary-50 to-green-50">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-primary-100 rounded-xl group-hover:scale-110 transition-transform">
            <Calendar class="w-6 h-6 text-primary-600" />
          </div>
          <span class="text-sm font-semibold text-primary-600">Próximo</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Módulo Pendiente</h3>
        <p class="text-sm text-gray-600">Ecosistemas y Biodiversidad</p>
      </div>

      <div class="card-hover group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
            <ClipboardCheck class="w-6 h-6 text-blue-600" />
          </div>
          <span class="text-sm font-semibold text-blue-600">Disponible</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Evaluación Lista</h3>
        <p class="text-sm text-gray-600">Módulo 1 - Introducción</p>
      </div>

      <div class="card-hover group cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform">
            <Trophy class="w-6 h-6 text-purple-600" />
          </div>
          <span class="text-sm font-semibold text-purple-600">Logro</span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Casi Terminas</h3>
        <p class="text-sm text-gray-600">75% completado</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { useCourseStore } from '@/store/modules/course'
import { Leaf, BookOpen, TrendingUp, CheckCircle, Award, ArrowRight, Calendar, ClipboardCheck, Trophy } from 'lucide-vue-next'
import StatsCard from '@/components/common/StatsCard.vue'
import CourseCard from '@/components/course/CourseCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()

const loading = ref(true)

const firstName = computed(() => authStore.user?.first_name || '')

const activeCourses = computed(() => 
  courseStore.myCourses.filter(c => c.status === 'en_progreso')
)

const stats = computed(() => ({
  activeCourses: activeCourses.value.length,
  totalProgress: Math.round(
    activeCourses.value.reduce((sum, c) => sum + (c.progress_percentage || 0), 0) / 
    (activeCourses.value.length || 1)
  ),
  evaluations: 5, // Placeholder
  certificates: courseStore.myCourses.filter(c => c.status === 'completado').length
}))

onMounted(async () => {
  await courseStore.fetchMyCourses()
  loading.value = false
})
</script>