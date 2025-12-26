<template>
  <div class="card-hover group overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-300">
    <div class="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
      <img v-if="course.thumbnail_url" :src="course.thumbnail_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div v-else class="flex items-center justify-center h-full">
        <Leaf class="w-24 h-24 text-white opacity-30" />
      </div>
      <div class="absolute top-4 right-4">
        <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary-700">
          {{ course.duration_hours }}h
        </span>
      </div>
    </div>

    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
        {{ course.title }}
      </h3>
      <p class="text-gray-600 text-sm line-clamp-2 mb-4">
        {{ course.short_description || course.description }}
      </p>

      <div class="flex items-center justify-between">
        <div class="flex items-center text-sm text-gray-500">
          <BookOpen class="w-4 h-4 mr-1" />
          <span>{{ course.total_modules || 0 }} módulos</span>
        </div>
        <div class="flex items-center text-sm text-gray-500">
          <Users class="w-4 h-4 mr-1" />
          <span>{{ course.total_enrollments || 0 }} estudiantes</span>
        </div>
      </div>

      <div v-if="progress !== undefined" class="mt-4">
        <ProgressBar :percentage="progress" label="Progreso" />
      </div>

      <button @click="$emit('click')" class="w-full mt-4 btn-primary group-hover:shadow-lg">
        {{ buttonText }}
        <ArrowRight class="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Leaf, BookOpen, Users, ArrowRight } from 'lucide-vue-next'
import ProgressBar from '@/components/common/ProgressBar.vue'

defineProps({
  course: Object,
  progress: Number,
  buttonText: {
    type: String,
    default: 'Ver curso'
  }
})

defineEmits(['click'])
</script>