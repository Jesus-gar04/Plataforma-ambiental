<template>
  <div class="card-hover group cursor-pointer border-l-4 hover:border-l-8 transition-all duration-300"
       :class="isCompleted ? 'border-green-500' : 'border-primary-500'">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center mb-2">
          <div class="flex items-center justify-center w-10 h-10 rounded-full mr-3"
               :class="isCompleted ? 'bg-green-100' : 'bg-primary-100'">
            <component :is="moduleIcon" :class="isCompleted ? 'text-green-600' : 'text-primary-600'" class="w-5 h-5" />
          </div>
          <div>
            <span class="text-xs font-semibold text-gray-500">Módulo {{ module.order_index }}</span>
            <h4 class="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
              {{ module.title }}
            </h4>
          </div>
        </div>

        <p class="text-sm text-gray-600 mb-3 ml-13">{{ module.description }}</p>

        <div class="flex items-center space-x-4 ml-13 text-sm text-gray-500">
          <div class="flex items-center">
            <Clock class="w-4 h-4 mr-1" />
            <span>{{ module.duration_minutes || 60 }} min</span>
          </div>
          <div class="flex items-center">
            <FileText class="w-4 h-4 mr-1" />
            <span>{{ module.total_contents || 0 }} contenidos</span>
          </div>
          <div class="flex items-center">
            <ClipboardCheck class="w-4 h-4 mr-1" />
            <span>{{ module.total_evaluations || 0 }} evaluaciones</span>
          </div>
        </div>
      </div>

      <div class="ml-4">
        <div v-if="isCompleted" class="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
          <CheckCircle2 class="w-6 h-6 text-green-600" />
        </div>
        <div v-else class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary-100 transition-colors">
          <Play class="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, FileText, ClipboardCheck, CheckCircle2, Play, Leaf, TreePine, Thermometer, Recycle } from 'lucide-vue-next'

const props = defineProps({
  module: Object,
  isCompleted: Boolean
})

const moduleIcon = computed(() => {
  const icons = { leaf: Leaf, tree: TreePine, thermometer: Thermometer, recycle: Recycle }
  return icons[props.module.icon_name] || Leaf
})
</script>